import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Like } from 'src/models/like.model';
import { Post } from 'src/models/post/post.model';
import { UpdatePost } from 'src/models/post/update-post.model';
import { PostsService } from 'src/posts/post.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'posts' })
  async findAllPosts() {
    return this.postsService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  post(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findById(id);
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
    @Args('authorId', { type: () => Int }) authorId: number,
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ) {
    return this.postsService.createPost({
      title,
      votes,
      description,
      mainImage,
      author: { connect: { id: authorId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      tags: [],
      content: content,
    });
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdatePost,
  ) {
    return this.postsService.updatePost(id, data);
  }

  async deletePost(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.deletePost(id);
  }
}
