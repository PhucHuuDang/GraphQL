import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryResolver } from './category.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CategoryRepository } from './category.repository.js';

@Module({
  providers: [CategoryService, CategoryResolver, CategoryRepository],
  imports: [PrismaModule],
})
export class CategoryModule {}
