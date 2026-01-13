import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import GraphQLJSON from 'graphql-type-json';
import { PostModel, PostPaginationInput } from './post.model';
import { UpdatePostInput } from './update-post.model';
import { PostsService } from './post.service';
import { generateSlug } from '../../utils/slug-stringify';
import type { GraphQLContext } from '../../interface/graphql.context';

@Resolver(() => PostModel)
export class PostResolver {
  private getClientIp({ req }: GraphQLContext) {
    const ip =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (req.ip as string | undefined);

    return ((ip as string) || 'unknown').replace('::ffff:', '');
  }
  private getIdentifier({ req, res }: GraphQLContext, identifier: string) {
    if (identifier) {
      return `guest:${identifier}`;
    }

    if (req) {
      const ip = this.getClientIp({ req, res });
      return `ip:${ip}`;
    }

    return `anonymous:${Date.now()}`;
  }
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [PostModel], { name: 'allPosts' })
  async findAllPosts() {
    const test = await this.postsService.findAll({
      include: {
        author: true,
        category: true,
      },
    });

    console.log({ test });

    return await this.postsService.findAll({
      include: {
        author: true,
        category: true,
      },
    });
  }

  @Query(() => [PostModel], { name: 'priorityPosts' })
  async findPriorityPosts(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.postsService.findPriorityPosts(limit);
  }

  @Query(() => [PostModel], { name: 'postPaginated' })
  async postPaginated(
    @Args('params', { type: () => PostPaginationInput })
    params: PostPaginationInput,
  ) {
    return this.postsService.postPaginated({
      page: params.page,
      limit: params.limit,
      extra: params.extra,
    });
  }

  @Query(() => PostModel)
  async findPostBySlug(
    @Args(
      'slug',
      { type: () => String },
      {
        transform(value, metadata) {
          return generateSlug(value);
        },
      },
    )
    slug: string,
  ) {
    return await this.postsService.findBySlug(slug);
  }

  @Query(() => PostModel, { name: 'findPostById' })
  async findPostById(@Args('id', { type: () => String }) id: string) {
    return await this.postsService.findById(id);
  }

  @Mutation(() => PostModel)
  async createPost(
    @Args('title') title: string,
    @Args('description', { type: () => String }) description: string,
    @Args('tags', { type: () => [String] }) tags: string[],
    @Args('content', { type: () => GraphQLJSON }) content: any,
    @Args('mainImage', { type: () => String }) mainImage: string,
    @Args('authorId', { type: () => String }) authorId: string,
    @Args('categoryId', { type: () => String }) categoryId: string,
    @Args('slug', { type: () => String }) slug: string,
    @Args('isPublished', { type: () => Boolean }) isPublished: boolean,
  ) {
    return this.postsService.createPost({
      title,
      description,
      mainImage,
      author: { connect: { id: authorId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      tags,
      content: content,
      slug,
      isPublished,
    });
  }

  @Mutation(() => PostModel)
  async updatePost(
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => UpdatePostInput })
    data: UpdatePostInput,

    @Context() context: GraphQLContext,
  ) {
    if (!id) {
      throw new BadRequestException('Id is required for update');
    }
    if (!data) {
      throw new BadRequestException('Data is required for update');
    }

    return await this.postsService.updatePost(
      id,
      {
        ...data,
        ...(data.slug ? { slug: generateSlug(data.slug) } : {}),
        updatedAt: new Date(),
      },
      context,
    );
  }

  @Mutation(() => PostModel)
  async deletePost(@Args('id', { type: () => String }) id: string) {
    return this.postsService.deletePost(id);
  }

  @Mutation(() => PostModel)
  async incrementViews(
    @Args('id', { type: () => String }) id: string,
    @Args('identifier', { type: () => String }) identifier: string,
    @Context() context: GraphQLContext,
  ) {
    const identifierResult = this.getIdentifier(context, identifier);
    return await this.postsService.incrementViews(id, identifierResult);
  }
}
