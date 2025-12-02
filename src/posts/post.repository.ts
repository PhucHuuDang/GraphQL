import { Injectable } from '@nestjs/common';
import { Post, Prisma } from 'generated/prisma/client';
import { BaseRepository, PaginationParams } from '../common/base.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostRepository extends BaseRepository<Post, Prisma.PostDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma.post, 'PostRepository');
  }

  async findById(id: string): Promise<Post | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findBySlugOrFail(slug: string) {
    return this.findOneOrFail({ slug });
  }

  async findPublishedPosts(params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        isPublished: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async searchPosts(searchTerm: string, params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        OR: [
          { title: { contains: searchTerm }, mode: 'insensitive' },
          { description: { contains: searchTerm }, mode: 'insensitive' },
        ],
        isPublished: true,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async postPaginated(
    params: PaginationParams & Prisma.SelectSubset<any, any>,
  ) {
    return this.findManyPaginated(params);
  }

  async findPriorityPosts(limit: number = 10) {
    return this.findAll({
      where: {
        isPublished: true,
        isDeleted: false,
        isPriority: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async incrementViews(id: string): Promise<Post | null> {
    return await this.update(id, {
      data: {
        views: { increment: 1 },
      },

      include: {
        author: true,
        category: true,
      },
    });
  }
}
