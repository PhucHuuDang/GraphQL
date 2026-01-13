import {
  Resolver,
  ResolveField,
  Args,
  Query,
  Parent,
  Int,
  Mutation,
} from '@nestjs/graphql';
import { Prisma } from '@prisma/client/extension';
import { CreateAuthor } from './author.dto';
import { AuthorsService } from '../../services/authors.service';
import { PostsService } from '../post/post.service';
import { Author } from './author.model';
import { PostModel } from '../post/post.model';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author, { name: 'author' })
  author(@Args('id', { type: () => String }) id: string) {}

  @ResolveField('posts', () => [PostModel])
  posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll();
  }

  @Mutation(() => Author)
  createAuthor(@Args('author') author: CreateAuthor) {
    return this.authorsService.createAuthor(author);
  }
  // @ResolveField('posts', () => [Post])
  // posts(@Parent() author: Author) {
  //   const { id } = author;
  //   return this.postsService.findAuthorPosts(
  // }
}
