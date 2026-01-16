import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  OptionalBooleanField,
  OptionalStringArrayField,
  OptionalStringField,
} from '../../../common/decorators/field.decorators';

/**
 * Input DTO for updating an existing post
 * All fields are optional
 */
@InputType()
export class UpdatePostInput {
  @OptionalStringField({
    minLength: 5,
    maxLength: 200,
    validationOptions: { message: 'Title must be between 5-200 characters' },
  })
  title?: string;

  @OptionalStringField({
    maxLength: 500,
    validationOptions: {
      message: 'Description must not exceed 500 characters',
    },
  })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  content?: any;

  @OptionalStringField()
  mainImage?: string;

  @OptionalStringArrayField()
  tags?: string[];

  @OptionalStringField()
  categoryId?: string;

  @OptionalStringField()
  slug?: string;

  @OptionalBooleanField()
  isPublished?: boolean;

  @OptionalBooleanField()
  isPriority?: boolean;

  @OptionalBooleanField()
  isPinned?: boolean;
}
