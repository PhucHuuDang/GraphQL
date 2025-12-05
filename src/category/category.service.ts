import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository.js';
import { Category, Prisma } from '../../generated/prisma/index.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    category: Prisma.CategoryCreateInput,
  ): Promise<Category> {
    return await this.categoryRepository.create(category);
  }
}
