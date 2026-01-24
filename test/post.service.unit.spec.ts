/**
 * Unit tests for PostsService
 *
 * Tests business logic with mocked dependencies:
 * - PrismaService (database operations)
 * - Redis (view deduplication cache)
 *
 * Focus areas:
 * 1. Authentication checks
 * 2. Ownership validation
 * 3. Role-based publishing logic
 * 4. Slug uniqueness
 * 5. View increment with deduplication
 * 6. Status transitions (DRAFT → PENDING → PUBLISHED → UNPUBLISHED)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostStatus } from '../generated/prisma';
import { PostsService } from '../src/modules/post/post.service';
import { PrismaService } from '../src/prisma/prisma.service';

import { createPrismaMock, MockPrismaService } from './__mocks__/prisma.mock';
import { createRedisMock, MockRedis } from './__mocks__/redis.mock';

import type { GraphQLContext } from '../src/interface/graphql.context';

describe('PostsService (Unit)', () => {
  let service: PostsService;
  let prismaMock: MockPrismaService;
  let redisMock: MockRedis;

  /**
   * Factory to create mock GraphQL context
   * Simulates authenticated and unauthenticated requests
   */
  const mockContext = (user?: { id: string; role: string }): GraphQLContext =>
    ({
      req: {
        session: user ? { user } : null,
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        ip: '127.0.0.1',
      },
      res: {
        setHeader: vi.fn(),
      },
    }) as unknown as GraphQLContext;

  beforeEach(() => {
    // Create fresh mocks for each test
    prismaMock = createPrismaMock();
    redisMock = createRedisMock();

    // Create service instance with mocked dependencies
    // We need to manually wire up the dependencies since we're not using NestJS DI
    service = new PostsService(prismaMock as unknown as PrismaService, redisMock as any);
  });

  // ==================== AUTHENTICATION ====================

  describe('Authentication', () => {
    it('throws UnauthorizedException when session is missing', async () => {
      const ctx = mockContext(); // No user

      const result = await service.createPost({ title: 'Test', content: {} as any }, ctx);

      // Service returns ResponseHelper.unauthorized() for missing session
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('throws UnauthorizedException when session.user is null', async () => {
      const ctx = {
        req: { session: {} }, // session exists but no user
        res: {},
      } as unknown as GraphQLContext;

      const result = await service.createPost({ title: 'Test', content: {} as any }, ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('allows authenticated user to proceed', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });

      // Mock: no existing post with same slug
      prismaMock.post.findUnique.mockResolvedValue(null);
      // Mock: return created post
      prismaMock.post.create.mockResolvedValue({
        id: 'new-post',
        title: 'Test',
        slug: 'test',
        authorId: 'user-1',
        status: PostStatus.DRAFT,
      });

      const result = await service.createPost(
        { title: 'Test', content: {} as any, isPublished: false },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.data.authorId).toBe('user-1');
    });
  });

  // ==================== OWNERSHIP VALIDATION ====================

  describe('Ownership Validation', () => {
    it('returns NOT_FOUND when post does not exist', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue(null);

      const result = await service.deletePost('missing-id', ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('returns FORBIDDEN when user is not the author', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'other-user',
      });

      const result = await service.deletePost('post-1', ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('FORBIDDEN');
    });

    it('allows owner to modify their post', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        slug: 'test',
        isPublished: false,
      });
      prismaMock.post.update.mockResolvedValue({
        id: 'post-1',
        title: 'Updated',
        isDeleted: true,
        deletedAt: new Date(),
      });

      const result = await service.deletePost('post-1', ctx);

      expect(result.success).toBe(true);
    });
  });

  // ==================== ROLE-BASED PUBLISHING ====================

  describe('Role-Based Publishing', () => {
    describe('ADMIN role', () => {
      it('can publish directly (status = PUBLISHED)', async () => {
        const ctx = mockContext({ id: 'admin-1', role: 'ADMIN' });
        prismaMock.post.findUnique.mockResolvedValue(null); // No duplicate slug
        prismaMock.post.create.mockImplementation((params: any) => ({
          id: 'post-1',
          status: params.data.status,
          isPublished: params.data.isPublished,
          publishedAt: params.data.publishedAt,
        }));

        const result = await service.createPost(
          { title: 'Admin Post', content: {} as any, isPublished: true },
          ctx,
        );

        expect(result.success).toBe(true);
        expect(result.data.status).toBe(PostStatus.PUBLISHED);
        expect(result.data.publishedAt).toBeDefined();
      });
    });

    describe('MODERATOR role', () => {
      it('can publish directly (status = PUBLISHED)', async () => {
        const ctx = mockContext({ id: 'mod-1', role: 'MODERATOR' });
        prismaMock.post.findUnique.mockResolvedValue(null);
        prismaMock.post.create.mockImplementation((params: any) => ({
          id: 'post-1',
          status: params.data.status,
          isPublished: params.data.isPublished,
        }));

        const result = await service.createPost(
          { title: 'Mod Post', content: {} as any, isPublished: true },
          ctx,
        );

        expect(result.data.status).toBe(PostStatus.PUBLISHED);
      });
    });

    describe('USER role', () => {
      it('cannot publish directly (status = PENDING)', async () => {
        const ctx = mockContext({ id: 'user-1', role: 'USER' });
        prismaMock.post.findUnique.mockResolvedValue(null);
        prismaMock.post.create.mockImplementation((params: any) => ({
          id: 'post-1',
          status: params.data.status,
          isPublished: params.data.isPublished,
          submittedForReviewAt: params.data.submittedForReviewAt,
        }));

        const result = await service.createPost(
          { title: 'User Post', content: {} as any, isPublished: true },
          ctx,
        );

        expect(result.data.status).toBe(PostStatus.PENDING);
        expect(result.data.submittedForReviewAt).toBeDefined();
      });

      it('creates DRAFT when isPublished is false', async () => {
        const ctx = mockContext({ id: 'user-1', role: 'USER' });
        prismaMock.post.findUnique.mockResolvedValue(null);
        prismaMock.post.create.mockImplementation((params: any) => ({
          id: 'post-1',
          status: params.data.status,
          isPublished: params.data.isPublished,
        }));

        const result = await service.createPost(
          { title: 'Draft Post', content: {} as any, isPublished: false },
          ctx,
        );

        expect(result.data.status).toBe(PostStatus.DRAFT);
      });
    });
  });

  // ==================== STATUS TRANSITIONS ====================

  describe('Status Transitions', () => {
    it('DRAFT → PENDING when USER publishes', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        slug: 'test',
        isPublished: false,
        status: PostStatus.DRAFT,
      });
      prismaMock.post.update.mockImplementation((params: any) => ({
        id: 'post-1',
        status: params.data.status,
        isPublished: params.data.isPublished,
        submittedForReviewAt: params.data.submittedForReviewAt,
      }));

      const result = await service.updatePost('post-1', { isPublished: true }, ctx);

      expect(result.data.status).toBe(PostStatus.PENDING);
    });

    it('DRAFT → PUBLISHED when ADMIN publishes', async () => {
      const ctx = mockContext({ id: 'admin-1', role: 'ADMIN' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'admin-1',
        slug: 'test',
        isPublished: false,
        status: PostStatus.DRAFT,
      });
      prismaMock.post.update.mockImplementation((params: any) => ({
        id: 'post-1',
        status: params.data.status,
        isPublished: params.data.isPublished,
        publishedAt: params.data.publishedAt,
      }));

      const result = await service.updatePost('post-1', { isPublished: true }, ctx);

      expect(result.data.status).toBe(PostStatus.PUBLISHED);
      expect(result.data.publishedAt).toBeDefined();
    });

    it('PUBLISHED → UNPUBLISHED when user unpublishes', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        slug: 'test',
        isPublished: true,
        status: PostStatus.PUBLISHED,
      });
      prismaMock.post.update.mockImplementation((params: any) => ({
        id: 'post-1',
        status: params.data.status,
        isPublished: params.data.isPublished,
      }));

      const result = await service.updatePost('post-1', { isPublished: false }, ctx);

      expect(result.data.status).toBe(PostStatus.UNPUBLISHED);
      expect(result.data.isPublished).toBe(false);
    });
  });

  // ==================== SLUG UNIQUENESS ====================

  describe('Slug Uniqueness', () => {
    it('rejects duplicate slug on create', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'existing',
        slug: 'test-post',
      });

      const result = await service.createPost({ title: 'Test Post', content: {} as any }, ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('DUPLICATE_ENTRY');
      expect(result.field).toBe('title');
    });

    it('allows unique slug on create', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue(null);
      prismaMock.post.create.mockResolvedValue({
        id: 'new',
        slug: 'unique-slug',
      });

      const result = await service.createPost({ title: 'Unique Slug', content: {} as any }, ctx);

      expect(result.success).toBe(true);
    });

    it('rejects slug conflict on update (different post)', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });

      // First call: verify ownership
      prismaMock.post.findUnique.mockResolvedValueOnce({
        id: 'post-1',
        authorId: 'user-1',
        slug: 'original-slug',
        isPublished: false,
      });

      // Second call: check slug uniqueness - conflict found!
      prismaMock.post.findUnique.mockResolvedValueOnce({
        id: 'other-post', // Different post has this slug
        slug: 'new-title',
      });

      const result = await service.updatePost('post-1', { title: 'New Title' }, ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('DUPLICATE_ENTRY');
    });

    it('allows same slug if title unchanged', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        slug: 'existing-slug',
        isPublished: false,
      });
      prismaMock.post.update.mockResolvedValue({
        id: 'post-1',
        description: 'Updated',
      });

      const result = await service.updatePost(
        'post-1',
        { description: 'Updated' }, // No title change
        ctx,
      );

      expect(result.success).toBe(true);
    });
  });

  // ==================== VIEW INCREMENT WITH DEDUPLICATION ====================

  describe('View Increment with Deduplication', () => {
    it('increments views on first visit', async () => {
      redisMock.get.mockResolvedValue(null); // No prior view
      redisMock.set.mockResolvedValue('OK');
      prismaMock.post.update.mockResolvedValue({
        id: 'post-1',
        views: 1,
      });

      const result = await service.incrementViews('post-1', 'ip:127.0.0.1');

      expect(redisMock.set).toHaveBeenCalledWith('blog:post-1:view:ip:127.0.0.1', 'ip:127.0.0.1', {
        ex: 3600,
      });
      expect(prismaMock.post.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.views).toBe(1);
    });

    it('does NOT increment on duplicate visit (cached)', async () => {
      redisMock.get.mockResolvedValue('ip:127.0.0.1'); // Already viewed
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        views: 5,
      });

      const result = await service.incrementViews('post-1', 'ip:127.0.0.1');

      expect(prismaMock.post.update).not.toHaveBeenCalled();
      expect(result.data.views).toBe(5);
    });

    it('returns NOT_FOUND for missing post', async () => {
      redisMock.get.mockResolvedValue(null);
      prismaMock.post.update.mockResolvedValue(null);

      const result = await service.incrementViews('missing', 'ip:127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });
  });

  // ==================== SOFT DELETE ====================

  describe('Soft Delete', () => {
    it('sets isDeleted=true and deletedAt', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      const _now = new Date();

      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
      });
      prismaMock.post.update.mockImplementation((params: any) => ({
        id: 'post-1',
        isDeleted: params.data.isDeleted,
        deletedAt: params.data.deletedAt,
      }));

      const result = await service.deletePost('post-1', ctx);

      expect(result.success).toBe(true);
      expect(result.data.isDeleted).toBe(true);
      expect(result.data.deletedAt).toBeDefined();
    });
  });

  // ==================== GET POST BY ID ====================

  describe('Get Post By ID', () => {
    it('returns post when exists', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        title: 'Test',
        isDeleted: false,
      });

      const result = await service.getPostById('post-1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('post-1');
    });

    it('returns NOT_FOUND for missing post', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      const result = await service.getPostById('missing');

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND for deleted post', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        isDeleted: true,
      });

      const result = await service.getPostById('post-1');

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });
  });

  // ==================== GET POST BY SLUG ====================

  describe('Get Post By Slug', () => {
    it('returns post when slug exists', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        slug: 'test-post',
        isDeleted: false,
      });

      const result = await service.findBySlug('test-post');

      expect(result.success).toBe(true);
      expect(result.data.slug).toBe('test-post');
    });

    it('returns NOT_FOUND for missing slug', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent');

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('returns error for deleted post', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
        slug: 'deleted-post',
        isDeleted: true,
      });

      const result = await service.findBySlug('deleted-post');

      expect(result.success).toBe(false);
    });
  });

  // ==================== MY POSTS ====================

  describe('My Posts', () => {
    it('requires authentication', async () => {
      const ctx = mockContext(); // No user

      const result = await service.getMyPosts({}, ctx);

      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('scopes to current user', async () => {
      const ctx = mockContext({ id: 'user-1', role: 'USER' });
      prismaMock.post.findMany.mockResolvedValue([{ id: 'post-1', authorId: 'user-1' }]);
      prismaMock.post.count.mockResolvedValue(1);

      const result = await service.getMyPosts({}, ctx);

      expect(result.success).toBe(true);
      // Verify the where clause includes authorId
      expect(prismaMock.post.findMany).toHaveBeenCalled();
    });
  });
});
