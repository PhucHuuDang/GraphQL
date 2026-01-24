import { INestApplication } from '@nestjs/common';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  cleanupTestApp,
  createTestApp,
  GraphQLTestClient,
  TestDatabase,
  TestDataFactory,
} from './test-setup';

describe('Post (E2E)', () => {
  let app: INestApplication;
  let testClient: GraphQLTestClient;
  let testDb: TestDatabase;
  let dataFactory: TestDataFactory;
  let authToken: string;
  let userId: string;
  let categoryId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    testClient = testApp.testClient;
    testDb = testApp.testDb;
    dataFactory = testApp.dataFactory;

    // Create and authenticate a user
    const signUpResponse = await testClient.mutate(
      `
      mutation SignUpEmail($signUpInput: SignUpInput!) {
        signUpEmail(signUpInput: $signUpInput) {
          token
          user {
            id
          }
        }
      }
    `,
      {
        signUpInput: {
          name: 'Post Tester',
          email: 'post-tester@example.com',
          password: 'Password123!',
          rememberMe: false,
        },
      },
    );
    authToken = signUpResponse.body.data.signUpEmail.token;
    userId = signUpResponse.body.data.signUpEmail.user.id;

    // Create a test category
    const category = await dataFactory.createCategory({
      name: 'Tech',
      description: 'Technology posts',
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await cleanupTestApp(app, testDb);
  });

  beforeEach(async () => {
    // Clean posts but keep user and category
    await testDb.getPrisma().post.deleteMany({});
  });

  describe('Create Post', () => {
    const CREATE_POST_MUTATION = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          success
          message
          data {
            id
            title
            slug
            content
            description
            mainImage
            tags
            isPublished
            categoryId
            authorId
          }
        }
      }
    `;

    it('should create a new post', async () => {
      const input = {
        title: 'My First Post',
        content: { blocks: [{ type: 'paragraph', data: { text: 'Hello World' } }] },
        description: 'This is a test post',
        categoryId,
        isPublished: true,
        tags: ['test', 'intro'],
      };

      const response = await testClient.mutate(CREATE_POST_MUTATION, { input }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.createPost.success).toBe(true);
      expect(response.body.data.createPost.data).toMatchObject({
        title: input.title,
        description: input.description,
        categoryId,
        authorId: userId,
        isPublished: true,
        tags: input.tags,
      });
      expect(response.body.data.createPost.data.slug).toBe('my-first-post');
    });

    it('should create draft post by default', async () => {
      const input = {
        title: 'Draft Post',
        content: { blocks: [] },
        categoryId,
      };

      const response = await testClient.mutate(CREATE_POST_MUTATION, { input }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.createPost.data.isPublished).toBe(false);
    });

    it('should require authentication', async () => {
      const input = {
        title: 'Unauthorized Post',
        content: { blocks: [] },
        categoryId,
      };

      const response = await testClient.mutate(CREATE_POST_MUTATION, { input });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidInput = {
        title: '',
        content: {},
        categoryId: '',
      };

      const response = await testClient.mutate(
        CREATE_POST_MUTATION,
        { input: invalidInput },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Get Posts', () => {
    const GET_POSTS_QUERY = `
      query Posts($filters: PostFiltersInput) {
        posts(filters: $filters) {
          success
          meta {
            page
            limit
            total
            totalPages
            hasNext
            hasPrev
          }
          data {
            id
            title
            slug
            description
            isPublished
            tags
            views
          }
        }
      }
    `;

    beforeEach(async () => {
      // Create test posts
      await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Post 1',
        isPublished: true,
        tags: ['tag1'],
      });
      await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Post 2',
        isPublished: true,
        tags: ['tag2'],
      });
      await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Draft Post',
        isPublished: false,
      });
    });

    it('should list all published posts', async () => {
      const response = await testClient.query(GET_POSTS_QUERY, {
        filters: { isPublished: true },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.success).toBe(true);
      expect(response.body.data.posts.data.length).toBe(2);
      expect(response.body.data.posts.meta.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await testClient.query(GET_POSTS_QUERY, {
        filters: { page: 1, limit: 1, isPublished: true },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.data.length).toBe(1);
      expect(response.body.data.posts.meta.totalPages).toBe(2);
      expect(response.body.data.posts.meta.hasNext).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await testClient.query(GET_POSTS_QUERY, {
        filters: { categoryId, isPublished: true },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.data.length).toBe(2);
    });

    it('should filter by tags', async () => {
      const response = await testClient.query(GET_POSTS_QUERY, {
        filters: { tags: ['tag1'], isPublished: true },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.data.length).toBe(1);
      expect(response.body.data.posts.data[0].title).toBe('Post 1');
    });

    it('should support search', async () => {
      const response = await testClient.query(GET_POSTS_QUERY, {
        filters: { search: 'Post 1', isPublished: true },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.data.length).toBeGreaterThan(0);
    });
  });

  describe('Get Single Post', () => {
    const GET_POST_QUERY = `
      query Post($id: String!) {
        post(id: $id) {
          success
          data {
            id
            title
            content
            description
            author {
              id
              name
            }
            category {
              id
              name
            }
          }
        }
      }
    `;

    it('should get post by ID', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Test Post',
        isPublished: true,
      });

      const response = await testClient.query(GET_POST_QUERY, { id: post.id });

      expect(response.status).toBe(200);
      expect(response.body.data.post.success).toBe(true);
      expect(response.body.data.post.data).toMatchObject({
        id: post.id,
        title: 'Test Post',
      });
      expect(response.body.data.post.data.author.id).toBe(userId);
    });

    it('should fail with non-existent ID', async () => {
      const response = await testClient.query(GET_POST_QUERY, {
        id: 'nonexistent-id',
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Get Post by Slug', () => {
    const GET_POST_BY_SLUG_QUERY = `
      query PostBySlug($slug: String!) {
        postBySlug(slug: $slug) {
          success
          data {
            id
            title
            slug
          }
        }
      }
    `;

    it('should get post by slug', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Unique Slug Post',
        isPublished: true,
      });

      const response = await testClient.query(GET_POST_BY_SLUG_QUERY, {
        slug: post.slug,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.postBySlug.success).toBe(true);
      expect(response.body.data.postBySlug.data.slug).toBe(post.slug);
    });
  });

  describe('Update Post', () => {
    const UPDATE_POST_MUTATION = `
      mutation UpdatePost($id: String!, $input: UpdatePostInput!) {
        updatePost(id: $id, input: $input) {
          success
          data {
            id
            title
            description
            isPublished
            isPinned
            isPriority
          }
        }
      }
    `;

    it('should update own post', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Original Title',
      });

      const input = {
        title: 'Updated Title',
        description: 'Updated description',
        isPublished: true,
      };

      const response = await testClient.mutate(
        UPDATE_POST_MUTATION,
        { id: post.id, input },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updatePost.success).toBe(true);
      expect(response.body.data.updatePost.data).toMatchObject({
        id: post.id,
        title: input.title,
        description: input.description,
        isPublished: true,
      });
    });

    it('should update post flags', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Post to Pin',
      });

      const input = {
        isPinned: true,
        isPriority: true,
      };

      const response = await testClient.mutate(
        UPDATE_POST_MUTATION,
        { id: post.id, input },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updatePost.data.isPinned).toBe(true);
      expect(response.body.data.updatePost.data.isPriority).toBe(true);
    });

    it('should fail when updating others post', async () => {
      // Create another user
      const otherUser = await dataFactory.createUser({
        email: 'other@example.com',
      });

      // Create post by other user
      const post = await dataFactory.createPost({
        authorId: otherUser.id,
        categoryId,
        title: 'Other Users Post',
      });

      const response = await testClient.mutate(
        UPDATE_POST_MUTATION,
        { id: post.id, input: { title: 'Hacked Title' } },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Delete Post', () => {
    const DELETE_POST_MUTATION = `
      mutation DeletePost($id: String!) {
        deletePost(id: $id) {
          success
          message
          deletedId
        }
      }
    `;

    it('should delete own post', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Post to Delete',
      });

      const response = await testClient.mutate(DELETE_POST_MUTATION, { id: post.id }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.deletePost.success).toBe(true);
      expect(response.body.data.deletePost.deletedId).toBe(post.id);

      // Verify soft delete
      const deletedPost = await testDb.getPrisma().post.findUnique({ where: { id: post.id } });
      expect(deletedPost?.isDeleted).toBe(true);
    });

    it('should fail when deleting others post', async () => {
      const otherUser = await dataFactory.createUser({
        email: 'another@example.com',
      });

      const post = await dataFactory.createPost({
        authorId: otherUser.id,
        categoryId,
        title: 'Protected Post',
      });

      const response = await testClient.mutate(DELETE_POST_MUTATION, { id: post.id }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Increment Views', () => {
    const INCREMENT_VIEWS_MUTATION = `
      mutation IncrementViews($id: String!, $identifier: String) {
        incrementViews(id: $id, identifier: $identifier) {
          success
          data {
            id
            views
          }
        }
      }
    `;

    it('should increment post views', async () => {
      const post = await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'Post with Views',
        isPublished: true,
      });

      const response = await testClient.mutate(INCREMENT_VIEWS_MUTATION, {
        id: post.id,
        identifier: 'unique-visitor-123',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.incrementViews.success).toBe(true);
      expect(response.body.data.incrementViews.data.views).toBeGreaterThan(0);
    });
  });

  describe('My Posts', () => {
    const MY_POSTS_QUERY = `
      query MyPosts($filters: PostFiltersInput!) {
        myPosts(filters: $filters) {
          success
          data {
            id
            title
            authorId
          }
          meta {
            total
          }
        }
      }
    `;

    it('should get only current user posts', async () => {
      // Create posts for current user
      await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'My Post 1',
      });
      await dataFactory.createPost({
        authorId: userId,
        categoryId,
        title: 'My Post 2',
      });

      // Create post for another user
      const otherUser = await dataFactory.createUser({
        email: 'someoneelse@example.com',
      });
      await dataFactory.createPost({
        authorId: otherUser.id,
        categoryId,
        title: 'Someone Elses Post',
      });

      const response = await testClient.query(MY_POSTS_QUERY, { filters: {} }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.myPosts.success).toBe(true);
      expect(response.body.data.myPosts.meta.total).toBe(2);
      expect(response.body.data.myPosts.data.every((post: any) => post.authorId === userId)).toBe(
        true,
      );
    });
  });
});
