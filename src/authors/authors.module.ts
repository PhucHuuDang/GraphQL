import { Module } from '@nestjs/common';
import { PostModule } from '../posts/post.module.js';
import { AuthorsResolver } from '../resolver/author.resolver.js';
import { AuthorsService } from '../services/authors.service.js';
import { AuthorRepository } from './author.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [AuthorsResolver, AuthorsService, AuthorRepository],
  imports: [PostModule, PrismaModule],
  exports: [AuthorsResolver],
})
export class AuthorsModule {}
