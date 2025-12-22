import { Module } from '@nestjs/common';
import { PostModule } from '../posts/post.module';
import { AuthorsResolver } from './author.resolver';
import { AuthorsService } from '../services/authors.service';
import { AuthorRepository } from './author.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [AuthorsResolver, AuthorsService, AuthorRepository],
  imports: [PostModule, PrismaModule],
  exports: [AuthorsResolver],
})
export class AuthorsModule {}
