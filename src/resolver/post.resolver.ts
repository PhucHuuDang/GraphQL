import {
  Args,
  Int,
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

  @Query(() => Post, { name: 'post' })
  post(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findById(id);
  }

  @ResolveField('likes', () => [Like])
  likes(@Parent() post: Post) {
    const { id } = post;
    return this.postsService.LikesInPost(id);
  }
}
