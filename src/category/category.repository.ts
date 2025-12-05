import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '../../generated/prisma/index.js';
import { BaseRepository } from '../common/base.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.category, 'CategoryRepository');
  }
}
