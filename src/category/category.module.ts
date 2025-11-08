import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryRepository } from './category.repository';

@Module({
  providers: [CategoryService, CategoryResolver, CategoryRepository],
  imports: [PrismaModule],
})
export class CategoryModule {}
