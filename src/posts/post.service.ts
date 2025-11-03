import { Injectable } from '@nestjs/common';
// import { Post } from 'src/models/post.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRepository } from './post.repository';
import { Post, Prisma } from 'generated/prisma/client';
import { PaginationParams, PaginationResult } from 'src/common/base.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(params?: Prisma.SelectSubset<any, any>): Promise<Post[]> {
    return await this.postRepository.findAll(params);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return await this.postRepository.findBySlug(slug);
  }

  async findPriorityPosts(limit: number = 10): Promise<Post[]> {
    return await this.postRepository.findPriorityPosts(limit);
  }

  async searchPosts(
    searchTerm: string,
    params: PaginationParams,
  ): Promise<PaginationResult<Post>> {
    return await this.postRepository.searchPosts(searchTerm, params);
  }
  async findPublishedPosts(
    params: PaginationParams,
  ): Promise<PaginationResult<Post>> {
    return await this.postRepository.findPublishedPosts(params);
  }

  async findById(id: number): Promise<Post | null> {
    return await this.postRepository.findById(id);
  }

  async postPaginated(
    params: PaginationParams,
  ): Promise<PaginationResult<Post>> {
    return await this.postRepository.postPaginated(params);
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return await this.postRepository.create(data);
  }

  async updatePost(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
    return await this.postRepository.update(id, data);
  }

  async incrementViews(id: number): Promise<Post> {
    return await this.postRepository.incrementViews(id);
  }

  async deletePost(id: number): Promise<Post> {
    return await this.postRepository.delete(id);
  }
}
