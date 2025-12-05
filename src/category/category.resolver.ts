import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service.js';
import { CategoryModel } from '../models/category.model.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CreateCategory } from './category.dto.js';

@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @AllowAnonymous()
  @Mutation(() => CategoryModel)
  async createCategory(
    @Args('category') category: CreateCategory,
  ): Promise<CategoryModel> {
    return await this.categoryService.createCategory({
      name: category.name,
      posts: {
        create: [],
      },
    });
  }
}
