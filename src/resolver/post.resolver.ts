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
import { UpdatePost } from 'src/models/post/update-post.model';
import { PostsService } from 'src/posts/post.service';
import { generateSlug } from 'src/utils/slug-stringify';

@AllowAnonymous()
@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'allPosts' })
  async findAllPosts() {
    return this.postsService.findAll();
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
    @Args('votes', { type: () => Int })
    votes: number,
    @Args('description', { type: () => String }) description: string,
    @Args('tags', { type: () => [String] }) tags: string[],
    @Args('content', { type: () => GraphQLJSON }) content: any,
    @Args('mainImage', { type: () => String }) mainImage: string,
    @Args('authorId', { type: () => String }) authorId: string,
    @Args('categoryId', { type: () => String }) categoryId: string,
    @Args('slug', { type: () => String }) slug: string,
  ) {
    return this.postsService.createPost({
      title,
      votes,
      description,
      mainImage,
      author: { connect: { id: authorId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      tags,
      content: content,
      slug,
    });
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => String }) id: string,
    @Args('data')
    data: UpdatePost,
  ) {
    return this.postsService.updatePost(id, data);
  }

  @Mutation(() => Post)
  async deletePost(@Args('id', { type: () => String }) id: string) {
    return this.postsService.deletePost(id);
  }
}
