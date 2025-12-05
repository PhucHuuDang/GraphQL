import { Module } from '@nestjs/common';
import { PostResolver } from '../resolver/post.resolver';
import { PostsService } from './post.service';
import { PostRepository } from './post.repository';

@Module({
  providers: [PostResolver, PostsService, PostRepository],
  exports: [PostResolver, PostsService, PostRepository],
})
export class PostModule {}
