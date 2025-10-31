import { Injectable } from '@nestjs/common';
import { Post } from 'generated/prisma/client';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostRepository extends BaseRepository<Post> {
  protected model: any;

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.model = prisma.post;
  }

  async deletePost(id: string): Promise<Post> {
    return await this.model.delete({ where: { id: Number(id) } });
  }
}
