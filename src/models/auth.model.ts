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
  user?: UserModel; // ← ADD THIS
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

// const data: {
//   session: {
//       id: string;
//       createdAt: Date;
//       updatedAt: Date;
//       userId: string;
//       expiresAt: Date;
//       token: string;
//       ipAddress?: string | null | undefined | undefined;
//       userAgent?: string | null | undefined | undefined;
//   };
//   user: {
//       id: string;
//       createdAt: Date;
//       updatedAt: Date;
//       email: string;
//       emailVerified: boolean;
//       name: string;
//       image?: string | null | undefined | undefined;
//   };
// } | null
