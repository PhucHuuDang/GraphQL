import { applyDecorators } from '@nestjs/common';

import { Field, FieldOptions, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ValidationOptions,
} from 'class-validator';

/**
 * Reusable field decorator options
 */
type CustomFieldOptions = FieldOptions & {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  validationOptions?: ValidationOptions;
};

export function NumberField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Number, {
      nullable: false,
      ...options,
    }),
    IsNumber(
      {
        ...options,
        allowNaN: false,
        allowInfinity: false,
      },
      options.validationOptions,
    ),
    IsNotEmpty(options.validationOptions),
  ];

  if (options.min !== undefined) {
    decorators.push(Min(options.min, options.validationOptions));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

export function OptionalNumberField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Number, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsNumber(
      {
        allowNaN: true,
        allowInfinity: true,
        ...options,
      },
      options.validationOptions,
    ),
    IsNotEmpty(options.validationOptions),
  ];

  if (options.min !== undefined) {
    decorators.push(Min(options.min, options.validationOptions));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Required string field with optional length validation
 * @example @StringField({ minLength: 5, maxLength: 200 })
 */
export function StringField(options: CustomFieldOptions = {}) {
  const decorators = [
    Field(() => String, {
      nullable: false,
      ...options,
    }),
    IsString(options.validationOptions),
    IsNotEmpty(options.validationOptions),
  ];

  if (options.minLength) {
    decorators.push(MinLength(options.minLength, options.validationOptions));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Optional string field with optional length validation
 * @example @OptionalStringField({ maxLength: 500 })
 */
export function OptionalStringField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => String, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsString(options.validationOptions),
  ];

  if (options.minLength) {
    decorators.push(MinLength(options.minLength, options.validationOptions));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Required integer field with optional range validation
 * @example @IntField({ min: 1, max: 100 })
 */
export function IntField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Int, {
      nullable: false,
      ...options,
    }),
    IsInt(options.validationOptions),
  ];

  if (options.min !== undefined) {
    decorators.push(Min(options.min, options.validationOptions));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Optional integer field with optional range validation
 * @example @OptionalIntField({ min: 1, defaultValue: 10 })
 */
export function OptionalIntField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Int, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsInt(options.validationOptions),
  ];

  if (options.min !== undefined) {
    decorators.push(Min(options.min, options.validationOptions));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max, options.validationOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Required boolean field
 * @example @BooleanField()
 */
export function BooleanField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => Boolean, {
      nullable: false,
      ...options,
    }),
    IsBoolean(),
  );
}

/**
 * Optional boolean field
 * @example @OptionalBooleanField({ defaultValue: false })
 */
export function OptionalBooleanField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => Boolean, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsBoolean(),
  );
}

/**
 * Required array field
 * @example @ArrayField(() => String)
 */
export function ArrayField(typeFunction: () => any, options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [typeFunction()], {
      nullable: false,
      ...options,
    }),
    IsArray(),
  );
}

/**
 * Optional array field
 * @example @OptionalArrayField(() => String)
 */
export function OptionalArrayField(typeFunction: () => any, options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [typeFunction()], {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsArray(),
  );
}

/**
 * Optional enum field
 * @example @OptionalEnumField(PostStatusFilter)
 */
export function OptionalEnumField<T extends object>(enumType: T, options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => enumType as any, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsEnum(enumType),
  );
}

/**
 * Required enum field
 * @example @EnumField(PostStatusFilter)
 */
export function EnumField<T extends object>(enumType: T, options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => String, {
      nullable: false,
      ...options,
    }),
    IsEnum(enumType),
  );
}

/**
 * Optional nested object field
 * @example @OptionalObjectField(() => CreateAuthorInput)
 */
export function OptionalObjectField(typeFunction: () => any, options: FieldOptions = {}) {
  return applyDecorators(
    Field(typeFunction, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    ValidateNested(),
    Type(typeFunction),
  );
}

/**
 * Required nested object field
 * @example @ObjectField(() => CreateAuthorInput)
 */
export function ObjectField(typeFunction: () => any, options: FieldOptions = {}) {
  return applyDecorators(
    Field(typeFunction, {
      nullable: false,
      ...options,
    }),
    ValidateNested(),
    Type(typeFunction),
  );
}

/**
 * Required string array field with each element validated as string
 * @example @StringArrayField({ description: 'List of tags' })
 */
export function StringArrayField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [String], {
      nullable: false,
      ...options,
    }),
    IsArray(),
    IsString({ each: true }),
  );
}

/**
 * Optional string array field with each element validated as string
 * @example @OptionalStringArrayField({ defaultValue: [] })
 */
export function OptionalStringArrayField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [String], {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
  );
}

export function NumberArrayField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [Number], {
      nullable: false,
      ...options,
    }),
    IsArray(),
    IsNumber({ allowNaN: false, allowInfinity: false }),
  );
}

export function OptionalNumberArrayField(options: FieldOptions = {}) {
  return applyDecorators(
    Field(() => [Number], {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsArray(),
    IsNumber({ allowNaN: false, allowInfinity: false }),
  );
}

export function DateField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Date, {
      nullable: false,
      ...options,
    }),
    IsDate(),
    IsNotEmpty(options.validationOptions),
  ];

  return applyDecorators(...decorators);
}

export function OptionalDateField(options: CustomFieldOptions = {}) {
  const decorators: PropertyDecorator[] = [
    Field(() => Date, {
      nullable: true,
      ...options,
    }),
    IsOptional(),
    IsDate(),
  ];

  return applyDecorators(...decorators);
}
