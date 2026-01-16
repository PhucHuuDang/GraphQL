import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostModel } from './post.model';
import { PostsService } from './post.service';
import { CreatePostInput } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.dto';
import { PostFiltersInput } from './dto/post-filters.dto';
import {
  DeletePostResponse,
  PaginatedPostsResponse,
  PostResponse,
  PostsArrayResponse,
} from './dto/post-response.dto';
import type { GraphQLContext } from '../../interface/graphql.context';
import { AuthGuard } from '../auth/auth.guard';
import { generateSlug } from '../../utils/slug-stringify';
import {
  ArrayItems,
  DeleteOperation,
  Paginated,
  SingleItem,
} from '../../common/decorators/response.decorators';

/**
 * GraphQL Resolver for Post operations
 * Handles CRUD operations for blog posts
 */
@Resolver(() => PostModel)
export class PostResolver {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Get client IP address from request headers
   */
  private getClientIp({ req }: GraphQLContext): string {
    const ip =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (req.ip as string | undefined);

    return ((ip as string) || 'unknown').replace('::ffff:', '');
  }

  /**
   * Get unique identifier for view tracking
   */
  private getIdentifier(
    { req, res }: GraphQLContext,
    identifier: string,
  ): string {
    if (identifier) {
      return `guest:${identifier}`;
    }

    if (req) {
      const ip = this.getClientIp({ req, res });
      return `ip:${ip}`;
    }

    return `anonymous:${Date.now()}`;
  }

  // ==================== Queries ====================

  /**
   * Get posts with advanced filtering and pagination
   */
  @Paginated('Posts retrieved successfully')
  @Query(() => PaginatedPostsResponse, {
    name: 'posts',
    description: 'Get posts with filters and pagination',
  })
  async getPosts(
    @Args('filters', { type: () => PostFiltersInput, nullable: true })
    filters?: PostFiltersInput,
  ) {
    return await this.postsService.findPostsWithFilters(filters ?? {});
  }

  /**
   * Get published posts only
   */
  @Paginated('Published posts retrieved successfully')
  @Query(() => PaginatedPostsResponse, {
    name: 'publishedPosts',
    description: 'Get only published posts',
  })
  async getPublishedPosts(@Args('filters') filters: PostFiltersInput) {
    return await this.postsService.findPostsWithFilters({
      ...filters,
      isPublished: true,
    });
  }

  /**
   * Get priority/featured posts
   */
  @ArrayItems('Priority posts retrieved successfully')
  @Query(() => PostsArrayResponse, { name: 'priorityPosts' })
  async getPriorityPosts(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return await this.postsService.findPriorityPosts(limit);
  }

  /**
   * Get a single post by ID
   */
  @SingleItem('Post retrieved successfully')
  @Query(() => PostResponse, {
    name: 'post',
    description: 'Get a single post by ID',
  })
  async getPostById(@Args('id', { type: () => String }) id: string) {
    return await this.postsService.getPostById(id);
  }

  /**
   * Get a single post by slug
   */
  @SingleItem('Post retrieved successfully')
  @Query(() => PostResponse, {
    name: 'postBySlug',
    description: 'Get a single post by slug',
  })
  async getPostBySlug(@Args('slug', { type: () => String }) slug: string) {
    const normalizedSlug = generateSlug(slug);
    return await this.postsService.findBySlug(normalizedSlug);
  }

  /**
   * Get my posts (authenticated user's posts)
   */
  @Paginated('Your posts retrieved successfully')
  @UseGuards(AuthGuard)
  @Query(() => PaginatedPostsResponse, {
    name: 'myPosts',
    description: "Get current user's posts",
  })
  async getMyPosts(
    @Args('filters') filters: PostFiltersInput,
    @Context() context: GraphQLContext,
  ) {
    return await this.postsService.getMyPosts(filters, context);
  }

  // ==================== Mutations ====================

  /**
   * Create a new post
   * Requires authentication
   */
  @SingleItem('Post created successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => PostResponse, {
    description: 'Create a new post (requires authentication)',
  })
  async createPost(
    @Args('input') input: CreatePostInput,
    @Context() context: GraphQLContext,
  ) {
    return await this.postsService.createPost(input, context);
  }

  /**
   * Update an existing post
   * Requires authentication and ownership
   */
  @SingleItem('Post updated successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => PostResponse, {
    description: 'Update a post (requires ownership)',
  })
  async updatePost(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePostInput,
    @Context() context: GraphQLContext,
  ) {
    return await this.postsService.updatePost(id, input, context);
  }

  /**
   * Delete a post (soft delete)
   * Requires authentication and ownership
   */
  @DeleteOperation('Post deleted successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => DeletePostResponse, {
    description: 'Delete a post (requires ownership)',
  })
  async deletePost(
    @Args('id', { type: () => String }) id: string,
    @Context() context: GraphQLContext,
  ) {
    return await this.postsService.deletePost(id, context);
  }

  /**
   * Increment view count for a post
   * Uses caching to prevent duplicate views
   */
  @SingleItem('View count updated successfully')
  @Mutation(() => PostResponse, {
    description: 'Increment post view count',
  })
  async incrementViews(
    @Args('id', { type: () => String }) id: string,
    @Args('identifier', { type: () => String, nullable: true })
    identifier: string,
    @Context() context: GraphQLContext,
  ) {
    const viewIdentifier = this.getIdentifier(context, identifier);
    return await this.postsService.incrementViews(id, viewIdentifier);
  }
}
