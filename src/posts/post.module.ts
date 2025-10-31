import { Module } from '@nestjs/common';
import { PostResolver } from 'src/resolver/post.resolver';
import { PostsService } from './post.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PostResolver, PostsService],
  exports: [PostResolver],
  // imports: [PrismaModule],
})
export class PostModule {}
