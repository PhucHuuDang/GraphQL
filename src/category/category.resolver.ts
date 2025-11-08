import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from 'src/models/category.model';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CreateCategory } from './category.dto';

@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @AllowAnonymous()
  @Mutation(() => Category)
  async createCategory(
    @Args('category') category: CreateCategory,
  ): Promise<Category> {
    return await this.categoryService.createCategory({
      name: category.name,
      posts: {
        create: [],
      },
    });
  }
}
