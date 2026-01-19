import { InputType, PartialType } from '@nestjs/graphql';

import { StringField } from '../../../common/decorators/field.decorators';

@InputType()
export class CreateCategoryDto {
  @StringField({
    description: 'Name of the category',
    minLength: 3,
    maxLength: 255,
    validationOptions: { message: 'Name must be between 3-255 characters' },
  })
  name: string;

  @StringField({
    description: 'Description of the category',
    minLength: 3,
    maxLength: 255,
    validationOptions: { message: 'Description must be between 3-255 characters' },
  })
  description: string;
}

@InputType()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
