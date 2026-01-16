import { InputType } from '@nestjs/graphql';
import {
  OptionalBooleanField,
  OptionalEnumField,
  OptionalIntField,
  OptionalStringArrayField,
  OptionalStringField,
} from '../../../common/decorators/field.decorators';

/**
 * Post status enum for filtering
 */
export enum PostStatusFilter {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

/**
 * Input for filtering and paginating posts
 */
@InputType()
export class PostFiltersInput {
  @OptionalIntField({ min: 1, defaultValue: 1 })
  page?: number;

  @OptionalIntField({ min: 1, defaultValue: 10 })
  limit?: number;

  @OptionalStringField({ description: 'Search term for title/description' })
  search?: string;

  @OptionalStringField({ description: 'Filter by category ID' })
  categoryId?: string;

  @OptionalStringField({ description: 'Filter by author ID' })
  authorId?: string;

  @OptionalStringArrayField({ description: 'Filter by tags' })
  tags?: string[];

  @OptionalEnumField(PostStatusFilter, { description: 'Filter by post status' })
  status?: PostStatusFilter;

  @OptionalBooleanField({ description: 'Show only published posts' })
  isPublished?: boolean;

  @OptionalBooleanField({ description: 'Show only priority posts' })
  isPriority?: boolean;

  @OptionalStringField({
    description: 'Sort by field',
    defaultValue: 'createdAt',
  })
  sortBy?: string;

  @OptionalStringField({ description: 'Sort order', defaultValue: 'desc' })
  sortOrder?: 'asc' | 'desc';
}
