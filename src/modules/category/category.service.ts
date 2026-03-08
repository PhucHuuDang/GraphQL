import { Injectable } from '@nestjs/common';

import { Category, Prisma } from '../../../generated/prisma';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { generateSlug } from '../../common/utils/slug-stringify';
import { BaseRepository } from '../../core/database/base.repository';
import { PrismaService } from '../../core/database/prisma.service';

import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService extends BaseRepository<Category, Prisma.CategoryDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma, 'category', 'CategoryService');
  }

  async findCategories() {
    const categories = await this.findAll({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ResponseHelper.successArray(categories, 'Categories retrieved successfully');
  }

  async createCategory(input: CreateCategoryDto) {
    const slug = generateSlug(input.name);

    try {
      const existingCategory = await this.findOne({
        OR: [{ name: input.name }, { slug }],
      });

      if (existingCategory) {
        return ResponseHelper.error(
          existingCategory.name === input.name
            ? 'Category with this name already exists'
            : 'Category with this slug already exists',
          'DUPLICATE_ENTRY',
          existingCategory.name === input.name ? 'name' : 'slug',
        );
      }

      const response = await this.create({
        ...input,
        slug,
      });

      return ResponseHelper.success(response, 'Category created successfully');
    } catch (error: any) {
      this.logger.error('Failed to create category', error?.stack);

      if (error?.code === 'P2002') {
        return ResponseHelper.error('Category already exists', 'DUPLICATE_ENTRY');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to create category',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  async updateCategory(id: string, input: UpdateCategoryDto) {
    try {
      const existingCategory = await this.findByIdOrFail(id);

      const slug = input.name ? generateSlug(input.name) : existingCategory.slug;

      if (input.name) {
        const duplicate = await this.findOne({
          AND: [{ id: { not: id } }, { OR: [{ name: input.name }, { slug }] }],
        });

        if (duplicate) {
          return ResponseHelper.error(
            duplicate.name === input.name
              ? 'Category with this name already exists'
              : 'Category with this slug already exists',
            'DUPLICATE_ENTRY',
            duplicate.name === input.name ? 'name' : 'slug',
          );
        }
      }

      const response = await this.update(id, {
        data: {
          ...input,
          ...(input.name && { slug }),
        },
      });

      return ResponseHelper.success(response, 'Category updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update category ${id}`, error?.stack);

      if (error?.status === 404) {
        return ResponseHelper.notFound('Category');
      }

      if (error?.code === 'P2002') {
        return ResponseHelper.error(
          'Category with this name/slug already exists',
          'DUPLICATE_ENTRY',
        );
      }

      return ResponseHelper.error(
        error?.message || 'Failed to update category',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  async deleteCategory(id: string) {
    try {
      await this.findByIdOrFail(id);

      const deleted = await this.delete({ where: { id } });

      return ResponseHelper.success(deleted, 'Category deleted successfully');
    } catch (error: any) {
      this.logger.error(`Failed to delete category ${id}`, error?.stack);

      if (error?.status === 404) {
        return ResponseHelper.notFound('Category');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to delete category',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }
}
