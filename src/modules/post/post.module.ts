import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostsService } from './post.service';

@Module({
  providers: [PostResolver, PostsService],
  exports: [PostResolver, PostsService],
})
export class PostModule {}
