import { Field, ObjectType, PickType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  OptionalObjectField,
  OptionalStringField,
  StringField,
} from '../../common/decorators/field.decorators';
import { BaseModel } from '../../common/models/base.model';
import { SessionModel } from '../../common/models/session.model';

import { UserModel } from './models/user.model';

@ObjectType()
export class OAuth2UserInfoModel extends BaseModel {
  @Field(() => String, { nullable: true })
  @StringField()
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @OptionalStringField()
  image?: string;

  @Field(() => Boolean, { nullable: true })
  emailVerified?: boolean;
}

@ObjectType()
export class SignUpEmailResponse extends PickType(UserModel, [
  'id',
  'email',
  'name',
  'image',
] as const) {}

@ObjectType()
export class SignInEmailUserResponse extends PickType(UserModel, [
  'id',
  'email',
  'name',
  'image',
  'createdAt',
  'updatedAt',
] as const) {}

@ObjectType()
export class GitHubUserResponse extends SignInEmailUserResponse {
  @Field(() => String)
  redirect: string;

  @Field(() => String)
  token: string;

  @Field(() => String)
  url: string;

  @Field(() => UserModel, { nullable: true })
  user?: UserModel;
}

@ObjectType()
export class SignUpEmailUser {
  // @Field({ nullable: true })
  @OptionalStringField({ description: 'Token' })
  token?: string;

  // @Field(() => UserModel, { nullable: true })
  @OptionalObjectField(() => UserModel, { nullable: true, description: 'Return user model' })
  user?: UserModel;
}

@ObjectType()
export class SignInEmailUser {
  // @Field(() => SignInEmailUserResponse)
  @OptionalStringField({ description: 'Token' })
  token?: string;
  @OptionalObjectField(() => SignInEmailUserResponse, {
    nullable: true,
    description: 'Return sign in user response',
  })
  user?: SignInEmailUserResponse;
}

@ObjectType()
export class GetSessionResponse {
  @Field(() => SessionModel)
  session: SessionModel;

  @Field(() => UserModel)
  user: UserModel;
}

@ObjectType()
export class SignOutResponse {
  @Field(() => Boolean)
  success: boolean;
}

@ObjectType()
export class GetProfileResponse {
  @Field(() => OAuth2UserInfoModel)
  user: OAuth2UserInfoModel;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: Record<string, any>;
}
