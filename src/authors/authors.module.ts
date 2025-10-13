import { Module } from '@nestjs/common';
import { AuthorsResolver } from 'src/resolver/author.resolver';
import { AuthorsService } from 'src/services/authors.service';
import { PostsService } from 'src/services/posts.service';

@Module({
  providers: [AuthorsResolver, AuthorsService, PostsService],

  exports: [AuthorsResolver],
})
export class AuthorsModule {}
