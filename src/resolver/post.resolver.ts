import { BadRequestException } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { InputJsonValue } from 'generated/prisma/runtime/library';
import GraphQLJSON from 'graphql-type-json';
import type { PaginationParams } from 'src/common/base.repository';
import { Post, PostPaginationInput } from 'src/models/post/post.model';
import { UpdatePostInput } from 'src/models/post/update-post.model';
import { PostsService } from 'src/posts/post.service';
import { generateSlug } from 'src/utils/slug-stringify';

@AllowAnonymous()
@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'allPosts' })
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

  @Query(() => Post, { name: 'findPostBySlug' })
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
}
