import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  BooleanField,
  OptionalStringArrayField,
  OptionalStringField,
  StringField,
} from '../../../common/decorators/field.decorators';

/**
 * Input DTO for creating a new post
 */
@InputType()
export class CreatePostInput {
  @StringField({
    description: 'Post title',
    minLength: 5,
    maxLength: 200,
    validationOptions: { message: 'Title must be between 5-200 characters' },
  })
  title: string;

  @OptionalStringField({
    description: 'Post description/excerpt',
    maxLength: 500,
    validationOptions: {
      message: 'Description must not exceed 500 characters',
    },
  })
  description?: string;

  @Field(() => GraphQLJSON, { description: 'Post content in JSON format' })
  @IsNotEmpty({ message: 'Content is required' })
  content: any;

  @OptionalStringField({ description: 'Main image URL' })
  mainImage?: string;

  @OptionalStringArrayField({ description: 'Post tags', defaultValue: [] })
  tags: string[];

  @OptionalStringField({ description: 'Category ID' })
  categoryId?: string;

  @BooleanField({
    description: 'Whether to publish immediately or save as draft',
    defaultValue: false,
  })
  isPublished: boolean;
}
