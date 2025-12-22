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
import { Author } from '../models/author.model';
import { PostModel } from '../models/post/post.model';
import { PostsService } from '../posts/post.service';
import { AuthorsService } from '../services/authors.service';

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
