import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Like } from 'src/models/like.model';
import { Post } from 'src/models/post.model';
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
    @Args('authorId', { type: () => Int }) authorId: number,
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ) {
    return this.postsService.createPost({
      title,
      votes,
      author: { connect: { id: authorId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      tags: [],
      content: { create: { json: {} } },
    });
  }

  async deletePost(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.deletePost(id);
  }
}
