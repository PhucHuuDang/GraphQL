import {
  Resolver,
  ResolveField,
  Args,
  Query,
  Parent,
  Int,
} from '@nestjs/graphql';
import { Author } from 'src/models/author.model';
import { Post } from 'src/models/post.model';
import { PostsService } from 'src/posts/post.service';
import { AuthorsService } from 'src/services/authors.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author, { name: 'author' })
  author(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField('posts', () => [Post])
  posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAuthorPosts(id);
  }
}
