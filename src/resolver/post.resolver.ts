import { BadRequestException } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';
import { InputJsonValue } from 'generated/prisma/runtime/library';
import GraphQLJSON from 'graphql-type-json';
import { Post, PostPaginationInput } from 'src/models/post/post.model';
import { UpdatePostInput } from 'src/models/post/update-post.model';
import { PostsService } from 'src/posts/post.service';
import { generateSlug } from 'src/utils/slug-stringify';

@AllowAnonymous()
@Resolver(() => Post)
export class PostResolver {
  private getClientIp(req: Request) {
    const ip =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      req.ip;

    return ((ip as string) || 'unknown').replace('::ffff:', ''); // Remove IPv6 prefix
  }
  private getIdentifier(req: Request, identifier: string) {
    if (identifier) {
      return `guest:${identifier}`;
    }

    if (req) {
      const ip = this.getClientIp(req);
      return `ip:${ip}`;
    }

    return `anonymous:${Date.now()}`;
  }
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'allPosts' })
  async findAllPosts() {
    return await this.postsService.findAll({
      include: {
        author: true,
        category: true,
      },
    });
  }

  @Query(() => [Post], { name: 'priorityPosts' })
  async findPriorityPosts(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.postsService.findPriorityPosts(limit);
  }

  @Query(() => [Post], { name: 'postPaginated' })
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

  @Query(() => Post)
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

  @Query(() => Post, { name: 'findPostById' })
  async findPostById(@Args('id', { type: () => String }) id: string) {
    return await this.postsService.findById(id);
  }

  @Mutation(() => Post)
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
    console.log({ slug });

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

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => UpdatePostInput })
    data: UpdatePostInput,
  ) {
    if (!id) {
      throw new BadRequestException('Id is required for update');
    }
    if (!data) {
      throw new BadRequestException('Data is required for update');
    }

    return await this.postsService.updatePost(id, {
      ...data,
      ...(data.slug ? { slug: generateSlug(data.slug) } : {}),
      updatedAt: new Date(),
    });
  }

  @Mutation(() => Post)
  async deletePost(@Args('id', { type: () => String }) id: string) {
    return this.postsService.deletePost(id);
  }

  @Mutation(() => Post)
  async incrementViews(
    @Args('id', { type: () => String }) id: string,
    @Args('identifier', { type: () => String }) identifier: string,
    @Context() context: { req: Request },
  ) {
    // console.log({ context });

    const identifierResult = this.getIdentifier(context.req, identifier);
    console.log({ identifierResult });
    return await this.postsService.incrementViews(id, identifierResult);
  }
}
