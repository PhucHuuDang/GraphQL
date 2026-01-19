import { Injectable } from '@nestjs/common';

import { Category, Prisma } from '../../../generated/prisma';
import { BaseRepository } from '../../common/base.repository';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug } from '../../utils/slug-stringify';

import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService extends BaseRepository<Category, Prisma.CategoryDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma.category, 'CategoryService');
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
      // Check if category with same name or slug already exists
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

      // Handle Prisma unique constraint violation
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
      // Check if category exists
      const existingCategory = await this.findByIdOrFail(id);

      // Only regenerate slug if name is being updated
      const slug = input.name ? generateSlug(input.name) : existingCategory.slug;

      // Check for duplicate name/slug (excluding current category)
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
          ...(input.name && { slug }), // Only update slug if name changed
        },
      });

      return ResponseHelper.success(response, 'Category updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update category ${id}`, error?.stack);

      // Handle not found error from findByIdOrFail
      if (error?.status === 404) {
        return ResponseHelper.notFound('Category');
      }

      // Handle Prisma unique constraint violation
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
