import { Module } from '@nestjs/common';
import { PostModule } from 'src/posts/post.module';
import { PostsService } from 'src/posts/post.service';
import { AuthorsResolver } from 'src/resolver/author.resolver';
import { AuthorsService } from 'src/services/authors.service';
import { AuthorRepository } from './author.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AuthorsResolver, AuthorsService, AuthorRepository],
  imports: [PostModule, PrismaModule],
  exports: [AuthorsResolver],
})
export class AuthorsModule {}
