import { Module } from '@nestjs/common';
import { PostResolver } from 'src/resolver/post.resolver';
import { PostsService } from './post.service';

@Module({
  providers: [PostResolver, PostsService],
  exports: [PostResolver],
})
export class PostModule {}
