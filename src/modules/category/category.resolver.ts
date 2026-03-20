import { UseGuards } from '@nestjs/common';

import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { ArrayItems, SingleItem } from '../../common/decorators/response.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ArrayResponse, SingleResponse } from '../../common/types/response.types';

import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryModel } from './models/category.model';
import { CategoryService } from './category.service';

// Create response types for GraphQL
@ObjectType()
export class CategoryResponse extends SingleResponse(CategoryModel) {}

@ObjectType()
export class CategoriesResponse extends ArrayResponse(CategoryModel) {}

@Resolver(() => CategoryModel)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @ArrayItems('Categories fetched successfully')
  @Query(() => CategoriesResponse, { name: 'categories' })
  async findCategories() {
    return await this.categoryService.findCategories();
  }

  @SingleItem('Category created successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => CategoryResponse, {
    description: 'Create a new category (requires authentication)',
  })
  async createCategory(@Args('input') input: CreateCategoryDto) {
    return await this.categoryService.createCategory(input);
  }

  @SingleItem('Category updated successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => CategoryResponse, { description: 'Update a category (requires authentication)' })
  async updateCategory(@Args('id') id: string, @Args('input') input: UpdateCategoryDto) {
    return await this.categoryService.updateCategory(id, input);
  }

  @SingleItem('Category deleted successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => CategoryResponse, { description: 'Delete a category (requires authentication)' })
  async deleteCategory(@Args('id') id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
