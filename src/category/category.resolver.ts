import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryModel } from '../models/category.model';
import { CreateCategory } from './category.dto';

@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

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
