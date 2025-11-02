import { Injectable } from '@nestjs/common';
// import { Post } from 'src/models/post.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRepository } from './post.repository';
import { Post, Prisma } from 'generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(): Promise<Post[]> {
    return await this.postRepository.findAll();
  }

  async findById(id: number): Promise<Post | null> {
    return await this.postRepository.findById(id);
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    console.log({ data });
    return await this.postRepository.create(data);
  }

  async updatePost(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
    return await this.postRepository.update(id, data);
  }

  async deletePost(id: number): Promise<Post> {
    return await this.postRepository.delete(id);
  }
}
