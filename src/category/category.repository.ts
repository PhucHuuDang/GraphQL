import { Injectable } from '@nestjs/common';
import { Category, Prisma } from 'generated/prisma';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.category, 'CategoryRepository');
  }
}
