import { Injectable } from '@nestjs/common';
import { Category, Prisma } from 'generated/prisma';
import { BaseRepository } from '../common/base.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.category, 'CategoryRepository');
  }
}
