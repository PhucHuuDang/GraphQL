import { Injectable } from '@nestjs/common';
// import { Post } from 'src/models/post.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRepository } from './post.repository';
import { Post } from 'generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(): Promise<Post[]> {
    return await this.postRepository.findAll();
  }
}
