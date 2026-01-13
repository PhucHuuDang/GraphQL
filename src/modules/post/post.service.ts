import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostRepository } from './post.repository';
import { Post, Prisma } from '../../../generated/prisma';
import {
  PaginationParams,
  PaginationResult,
} from '../../common/base.repository';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS } from '../../lib/key';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(UPSTASH_REDIS) private readonly upstashRedis: Redis,
  ) {}

  async findAll(params?: Prisma.SelectSubset<any, any>): Promise<Post[]> {
    return await this.postRepository.findAll(params);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return await this.postRepository.findUnique(
      { slug },
      {
        include: {
          author: true,
          category: true,
        },
      },
    );
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

  async findById(id: string): Promise<Post | null> {
    return await this.postRepository.findById(id);
  }

  async postPaginated(
    params: PaginationParams,
  ): Promise<PaginationResult<Post>> {
    return await this.postRepository.postPaginated(params);
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    // console.log({ data });
    return await this.postRepository.create(data);
  }

  async updatePost(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return await this.postRepository.update(id, data);
  }

  async incrementViews(id: string, identifier: string) {
    const cacheKey = `blog:${id}:view:${identifier}`;

    const hasViewed = await this.upstashRedis.get(cacheKey);

    // console.log('Cache check:', { cacheKey, hasViewed });

    if (hasViewed) {
      const blog = await this.postRepository.findById(id);

      // console.log('Already viewed, returning current views:', blog?.views);

      return blog;
    }

    await this.upstashRedis.set(cacheKey, identifier, { ex: 3600 });

    const updatedPost = await this.postRepository.incrementViews(id);

    console.log('View incremented:', updatedPost?.views);

    return updatedPost;

    // return await this.postRepository.incrementViews(id);
  }

  async deletePost(id: string): Promise<Post> {
    return await this.postRepository.delete(id);
  }
}
