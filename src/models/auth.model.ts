import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { SessionModel } from './session.model';

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
  @Field(() => String, { nullable: true })
  token?: string;
  @Field(() => SignUpEmailResponse)
  user: SignUpEmailResponse;
}

@ObjectType()
export class SignInEmailUser {
  @Field(() => String)
  token: string;

  @Field(() => String)
  redirect: string;

  @Field(() => String)
  url: string;

  @Field(() => SignInEmailUserResponse)
  user: SignInEmailUserResponse;
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
