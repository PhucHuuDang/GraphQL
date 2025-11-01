import { Injectable } from '@nestjs/common';
import { Post, Prisma } from 'generated/prisma/client';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostRepository extends BaseRepository<Post> {
  constructor(prisma: PrismaService) {
    super(prisma.post);
  }

  async deletePost(id: string): Promise<Post> {
    return await this.model.delete({ where: { id: Number(id) } });
  }

  async findById(id: number): Promise<Post | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return await this.model.create({ data });
  }
}
