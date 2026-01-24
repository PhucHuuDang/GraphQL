import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Redis } from '@upstash/redis';

import { Post, PostStatus, Prisma } from '../../../generated/prisma';
import { BaseRepository, PaginationParams } from '../../common/base.repository';
import { ResponseHelper } from '../../common/helpers/response.helper';
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
    super(prisma, 'post', 'PostsService');
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

  async findBySlug(slug: string) {
    try {
      const post = await this.findUnique(
        { slug },
        {
          include: {
            author: true,
            category: true,
          },
        },
      );

      if (!post) {
        return ResponseHelper.notFound('Post');
      }

      if (post.isDeleted) {
        return ResponseHelper.error('Post has been deleted', 'NOT_FOUND');
      }

      return ResponseHelper.success(post, 'Post retrieved successfully');
    } catch (error: any) {
      this.logger.error(`Failed to find post by slug: ${slug}`, error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve post',
        error?.code || 'INTERNAL_ERROR',
      );
    }
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
    try {
      const posts = await this.findAll({
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
              image: true,
            },
          },
        },
      });

      return ResponseHelper.successArray(posts, 'Priority posts retrieved successfully');
    } catch (error: any) {
      this.logger.error('Failed to find priority posts', error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve priority posts',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Create a new post
   */
  async createPost(input: CreatePostInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      // Generate slug from title
      const slug = generateSlug(input.title);

      // Check if slug already exists
      const existingPost = await this.findUnique({ slug });
      if (existingPost) {
        return ResponseHelper.error(
          'A post with this title already exists',
          'DUPLICATE_ENTRY',
          'title',
        );
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

      const post = await this.create(postData, {
        author: true,
        category: true,
      });

      return ResponseHelper.success(post, 'Post created successfully');
    } catch (error: any) {
      this.logger.error('Failed to create post', error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      if (error?.code === 'P2002') {
        return ResponseHelper.error('A post with this title already exists', 'DUPLICATE_ENTRY');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to create post',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Update a post
   */
  async updatePost(id: string, input: UpdatePostInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      // Verify ownership
      const post = await this.verifyPostOwnership(id, user.id);

      // Generate new slug if title is being updated
      const slug = input.slug || (input.title ? generateSlug(input.title) : undefined);

      // Check slug uniqueness if it's being changed
      if (slug && slug !== post.slug) {
        const existingPost = await this.findUnique({ slug });
        if (existingPost && existingPost.id !== id) {
          return ResponseHelper.error(
            'A post with this title already exists',
            'DUPLICATE_ENTRY',
            'title',
          );
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

      const updatedPost = await this.update(id, {
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: true,
        },
      });

      return ResponseHelper.success(updatedPost, 'Post updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update post ${id}`, error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      if (error instanceof ForbiddenException) {
        return ResponseHelper.forbidden(error.message);
      }

      if (error instanceof NotFoundException) {
        return ResponseHelper.notFound('Post');
      }

      if (error?.code === 'P2002') {
        return ResponseHelper.error('A post with this title already exists', 'DUPLICATE_ENTRY');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to update post',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  async incrementViews(id: string, identifier: string) {
    try {
      const cacheKey = `blog:${id}:view:${identifier}`;
      const hasViewed = await this.upstashRedis.get(cacheKey);

      let post;

      if (hasViewed) {
        post = await this.findById(id);
      } else {
        await this.upstashRedis.set(cacheKey, identifier, { ex: 3600 });
        // Use built-in increment method
        post = await this.increment(id, 'views', 1);
      }

      if (!post) {
        return ResponseHelper.notFound('Post');
      }

      return ResponseHelper.success(post, 'View count updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to increment views for post ${id}`, error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to update view count',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Delete a post (soft delete)
   */
  async deletePost(id: string, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      // Verify ownership
      await this.verifyPostOwnership(id, user.id);

      // Use built-in soft delete
      const deletedPost = await this.softDelete(id);

      return ResponseHelper.success(deletedPost, 'Post deleted successfully');
    } catch (error: any) {
      this.logger.error(`Failed to delete post ${id}`, error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      if (error instanceof ForbiddenException) {
        return ResponseHelper.forbidden(error.message);
      }

      if (error instanceof NotFoundException) {
        return ResponseHelper.notFound('Post');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to delete post',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Get my posts (posts created by the current user)
   */
  async getMyPosts(filters: PostFiltersInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      return await this.findPostsWithFilters({
        ...filters,
        authorId: user.id,
      });
    } catch (error: any) {
      this.logger.error('Failed to get user posts', error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      return ResponseHelper.error(
        error?.message || 'Failed to retrieve your posts',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Find posts with advanced filters
   */
  async findPostsWithFilters(filters: PostFiltersInput) {
    try {
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

      const result = await this.findManyPaginated({
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
              image: true,
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

      return ResponseHelper.successPaginated(result, 'Posts retrieved successfully');
    } catch (error: any) {
      this.logger.error('Failed to find posts with filters', error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve posts',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Get post by ID with full details
   */
  async getPostById(id: string) {
    try {
      const post = await this.findById(id);

      if (!post) {
        return ResponseHelper.notFound('Post');
      }

      if (post.isDeleted) {
        return ResponseHelper.error('Post has been deleted', 'NOT_FOUND');
      }

      return ResponseHelper.success(post, 'Post retrieved successfully');
    } catch (error: any) {
      this.logger.error(`Failed to get post by ID: ${id}`, error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve post',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Check if user can edit post
   */
  async canUserEditPost(postId: string, userId: string): Promise<boolean> {
    const post = await this.findById(postId);
    return post && post.authorId === userId;
  }
}
