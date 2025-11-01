import { Module } from '@nestjs/common';
import { PostResolver } from 'src/resolver/post.resolver';
import { PostsService } from './post.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostRepository } from './post.repository';

@Module({
  providers: [PostResolver, PostsService, PostRepository],
  exports: [PostResolver, PostsService, PostRepository],
  imports: [PrismaModule],
})
export class PostModule {}
