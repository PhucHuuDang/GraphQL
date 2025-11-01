import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PostRepository } from 'src/posts/post.repository';

@Module({
  providers: [PrismaService, PostRepository],
  exports: [PrismaService, PostRepository],
  imports: [ConfigModule],
})
export class PrismaModule {}
