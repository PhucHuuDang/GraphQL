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
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CreateAuthor } from 'src/authors/author.dto';
import { Author } from 'src/models/author.model';
import { Post } from 'src/models/post/post.model';
import { PostsService } from 'src/posts/post.service';
import { AuthorsService } from 'src/services/authors.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author, { name: 'author' })
  author(@Args('id', { type: () => String }) id: string) {}

  @ResolveField('posts', () => [Post])
  posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll();
  }

  @AllowAnonymous()
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
