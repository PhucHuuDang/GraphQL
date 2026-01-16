import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Redis } from '@upstash/redis';

import { Post, PostStatus, Prisma } from '../../../generated/prisma';
import { BaseRepository, PaginationParams, PaginationResult } from '../../common/base.repository';
import { GraphQLContext } from '../../interface/graphql.context';
import { UPSTASH_REDIS } from '../../lib/key';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug } from '../../utils/slug-stringify';

import { CreatePostInput } from './dto/create-post.dto';
import { PostFiltersInput } from './dto/post-filters.dto';
import { UpdatePostInput } from './dto/update-post.dto';

@Injectable()
export class PostsService extends BaseRepository<Post, Prisma.PostDelegate> {
  constructor(
    prisma: PrismaService,
    @Inject(UPSTASH_REDIS) private readonly upstashRedis: Redis,
  ) {
    super(prisma.post, 'PostsService');
  }

  /**
   * Get authenticated user from context
   */
  private getAuthenticatedUser(context: GraphQLContext) {
    const session = context.req['session'];
    if (!session || !session.user) {
      throw new UnauthorizedException('You must be logged in to perform this action');
    }
    return session.user;
  }

  /**
   * Verify post ownership
   */
  private async verifyPostOwnership(postId: string, userId: string): Promise<Post> {
    const post = await this.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    return post;
  }

  /**
   * Check if user can publish posts
   */
  private canPublishPost(userRole: string): boolean {
    return ['ADMIN', 'MODERATOR'].includes(userRole);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return await this.findUnique(
      { slug },
      {
        include: {
          author: true,
          category: true,
        },
      },
    );
  }

  async findBySlugOrFail(slug: string) {
    return this.findOneOrFail({ slug });
  }

  async findPublishedPosts(params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        isPublished: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async searchPosts(searchTerm: string, params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        OR: [
          { title: { contains: searchTerm }, mode: 'insensitive' },
          { description: { contains: searchTerm }, mode: 'insensitive' },
        ],
        isPublished: true,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async postPaginated(params: PaginationParams & Prisma.SelectSubset<any, any>) {
    return this.findManyPaginated(params);
  }

  async findPriorityPosts(limit: number = 10) {
    return this.findAll({
      where: {
        isPublished: true,
        isDeleted: false,
        isPriority: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Create a new post
   */
  async createPost(input: CreatePostInput, context: GraphQLContext): Promise<Post> {
    const user = this.getAuthenticatedUser(context);

    // Generate slug from title
    const slug = generateSlug(input.title);

    // Check if slug already exists
    const existingPost = await this.findUnique({ slug });
    if (existingPost) {
      throw new BadRequestException('A post with this title already exists');
    }

    // Determine post status based on publication and user role
    let status: PostStatus = PostStatus.DRAFT;

    if (input.isPublished) {
      // If user wants to publish, check permissions
      if (this.canPublishPost(user.role)) {
        status = PostStatus.PUBLISHED;
      } else {
        // Regular users must submit for review
        status = PostStatus.PENDING;
      }
    }

    const postData: Prisma.PostCreateInput = {
      title: input.title,
      slug,
      description: input.description,
      content: input.content,
      mainImage: input.mainImage,
      tags: input.tags || [],
      isPublished: input.isPublished,
      status,
      author: {
        connect: { id: user.id },
      },
      ...(input.categoryId && {
        category: {
          connect: { id: input.categoryId },
        },
      }),
      ...(status === PostStatus.PUBLISHED && {
        publishedAt: new Date(),
      }),
      ...(status === PostStatus.PENDING && {
        submittedForReviewAt: new Date(),
      }),
    };

    return await this.create(postData, {
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });
  }

  /**
   * Update a post
   */
  async updatePost(id: string, input: UpdatePostInput, context: GraphQLContext): Promise<Post> {
    const user = this.getAuthenticatedUser(context);

    // Verify ownership
    const post = await this.verifyPostOwnership(id, user.id);

    // Generate new slug if title is being updated
    const slug = input.slug || (input.title ? generateSlug(input.title) : undefined);

    // Check slug uniqueness if it's being changed
    if (slug && slug !== post.slug) {
      const existingPost = await this.findUnique({ slug });
      if (existingPost && existingPost.id !== id) {
        throw new BadRequestException('A post with this title already exists');
      }
    }

    // Handle status changes
    let statusUpdate: Partial<Prisma.PostUpdateInput> = {};

    if (input.isPublished !== undefined) {
      if (input.isPublished && !post.isPublished) {
        // Publishing a post
        if (this.canPublishPost(user.role)) {
          statusUpdate = {
            status: PostStatus.PUBLISHED,
            isPublished: true,
            publishedAt: new Date(),
          };
        } else {
          // Submit for review
          statusUpdate = {
            status: PostStatus.PENDING,
            isPublished: false,
            submittedForReviewAt: new Date(),
          };
        }
      } else if (!input.isPublished && post.isPublished) {
        // Unpublishing a post
        statusUpdate = {
          status: PostStatus.UNPUBLISHED,
          isPublished: false,
        };
      }
    }

    const updateData: Prisma.PostUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(slug && { slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.content && { content: input.content }),
      ...(input.mainImage !== undefined && { mainImage: input.mainImage }),
      ...(input.tags && { tags: input.tags }),
      ...(input.categoryId && {
        category: {
          connect: { id: input.categoryId },
        },
      }),
      ...(input.isPriority !== undefined && { isPriority: input.isPriority }),
      ...(input.isPinned !== undefined && { isPinned: input.isPinned }),
      ...statusUpdate,
      updatedAt: new Date(),
    };

    return await this.update(id, {
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });
  }

  async incrementViews(id: string, identifier: string) {
    const cacheKey = `blog:${id}:view:${identifier}`;
    const hasViewed = await this.upstashRedis.get(cacheKey);

    if (hasViewed) {
      return await this.findById(id);
    }

    await this.upstashRedis.set(cacheKey, identifier, { ex: 3600 });

    // Use built-in increment method
    return await this.increment(id, 'views', 1);
  }

  /**
   * Delete a post (soft delete)
   */
  async deletePost(id: string, context: GraphQLContext): Promise<Post> {
    const user = this.getAuthenticatedUser(context);

    // Verify ownership
    await this.verifyPostOwnership(id, user.id);

    // Use built-in soft delete
    return await this.softDelete(id);
  }

  /**
   * Get my posts (posts created by the current user)
   */
  async getMyPosts(
    filters: PostFiltersInput,
    context: GraphQLContext,
  ): Promise<PaginationResult<Post>> {
    const user = this.getAuthenticatedUser(context);

    return await this.findPostsWithFilters({
      ...filters,
      authorId: user.id,
    });
  }

  /**
   * Find posts with advanced filters
   */
  async findPostsWithFilters(filters: PostFiltersInput): Promise<PaginationResult<Post>> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      authorId,
      tags,
      status,
      isPublished,
      isPriority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.PostWhereInput = {
      isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(authorId && { authorId }),
      ...(tags &&
        tags.length > 0 && {
          tags: {
            hasSome: tags,
          },
        }),
      ...(status && { status }),
      ...(isPublished !== undefined && { isPublished }),
      ...(isPriority !== undefined && { isPriority }),
    };

    return await this.findManyPaginated({
      where,
      page,
      limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });
  }

  /**
   * Get post by ID with full details
   */
  async getPostById(id: string): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.isDeleted) {
      throw new NotFoundException('Post has been deleted');
    }

    return post;
  }

  /**
   * Check if user can edit post
   */
  async canUserEditPost(postId: string, userId: string): Promise<boolean> {
    const post = await this.findById(postId);
    return post && post.authorId === userId;
  }
}
