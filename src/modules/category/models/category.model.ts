import { ObjectType } from '@nestjs/graphql';

import { StringField } from '../../../common/decorators/field.decorators';
import { BaseModel } from '../../../common/models/base.model';

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
}
