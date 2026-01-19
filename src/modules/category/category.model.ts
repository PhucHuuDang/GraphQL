import { Field, Int, ObjectType } from '@nestjs/graphql';

import { isNullableType } from 'graphql';

import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

import { ArrayField, StringField } from '../../common/decorators/field.decorators';
import { BaseModel } from '../../models/base.model';
import { PostModel } from '../post/post.model';

@ObjectType()
export class CategoryModel extends BaseModel {
  @StringField({
    description: 'Name of the category',
    minLength: 3,
    maxLength: 255,
    validationOptions: { message: 'Name must be between 3-255 characters' },
  })
  name: string;

  @StringField({
    description: 'Slug of the category',
    minLength: 3,
    maxLength: 255,
    validationOptions: {
      message: 'Slug must be unique. Usually generated automatically from name',
    },
  })
  slug: string;

  @StringField({
    description: 'Description of the category',
    minLength: 3,
    maxLength: 255,
    validationOptions: { message: 'Description must be between 3-255 characters' },
  })
  description: string;

  @ArrayField(() => PostModel, { nullable: false, description: 'Posts in this category' })
  posts?: PostModel[];
}
