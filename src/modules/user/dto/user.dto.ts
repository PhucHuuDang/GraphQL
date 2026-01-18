import { ArgsType, Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  OptionalBooleanField,
  OptionalEmailField,
  OptionalStringField,
  StringField,
} from '../../../common/decorators/field.decorators';

@InputType()
export class SignUpInput {
  @StringField({
    description: 'Name',
    nullable: false,
    validationOptions: {
      message: 'Name is required',
    },
  })
  name: string;

  @StringField({
    description: 'Email',
    nullable: false,
    validationOptions: {
      message: 'Email is required and must be a valid email address',
    },
  })
  email: string;

  @StringField({
    description: 'Password',
    nullable: false,
    validationOptions: {
      message: 'Password is required',
    },
  })
  password: string;

  @OptionalBooleanField({
    description: 'Remember me',
    nullable: true,
    defaultValue: false,
  })
  rememberMe?: boolean;
}

@InputType()
export class SignInInput {
  @StringField({
    description: 'Email',
    nullable: false,
    validationOptions: {
      message: 'Email is required and must be a valid email address',
    },
  })
  email: string;

  @StringField({
    minLength: 8,
    maxLength: 20,
    validationOptions: {
      message: 'Password must be between 8-20 characters',
    },
    description: 'Password',
    nullable: false,
  })
  password: string;

  @OptionalBooleanField({
    description: 'Remember me',
    nullable: true,
    defaultValue: false,
  })
  rememberMe?: boolean;
}

@ArgsType()
export class UpdateProfileArgs {
  @OptionalEmailField({
    description: 'Email can be optional when updating profile',
  })
  email?: string;

  @OptionalStringField({
    description: 'Name',
    nullable: true,
    defaultValue: null,
  })
  name?: string;

  @OptionalStringField({
    description: 'Image',
    nullable: true,
    defaultValue: null,
  })
  image?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  password?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
