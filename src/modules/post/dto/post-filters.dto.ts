import { InputType } from '@nestjs/graphql';
import {
  OptionalBooleanField,
  OptionalEnumField,
  OptionalIntField,
  OptionalStringArrayField,
  OptionalStringField,
} from '../../../common/decorators/field.decorators';
import { dynamicRegisterEnum } from '../../../common/registers/dynamic-register-enum';

export enum PostStatusFilter {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

dynamicRegisterEnum(PostStatusFilter, {
  name: 'PostStatusFilter',
  description: 'Filter posts by their status',
  customDescriptions: {
    DRAFT: 'Posts in draft state - not visible to public',
    PENDING: 'Posts pending moderator approval',
    APPROVED: 'Approved posts ready to be published',
    REJECTED: 'Rejected posts that failed moderation',
    PUBLISHED: 'Published posts visible to everyone',
    UNPUBLISHED: 'Previously published posts that are now hidden',
  },
});

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
