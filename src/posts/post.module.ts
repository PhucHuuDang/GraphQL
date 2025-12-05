import { Module } from '@nestjs/common';
import { PostResolver } from '../resolver/post.resolver.js';
import { PostsService } from './post.service.js';
import { PostRepository } from './post.repository.js';

@Module({
  providers: [PostResolver, PostsService, PostRepository],
  exports: [PostResolver, PostsService, PostRepository],
})
export class PostModule {}
