import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from './base.model';
import { UserModel } from './user.model';

@ObjectType()
export class AccountModel extends BaseModel {
  @Field(() => String)
  accountId: string;

  @Field(() => String)
  providerId: string;

  @Field(() => String)
  userId: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field(() => String, { nullable: true })
  idToken?: string;

  @Field(() => Date, { nullable: true })
  accessTokenExpiresAt?: Date;

  @Field(() => Date, { nullable: true })
  refreshTokenExpiresAt?: Date;

  @Field(() => String, { nullable: true })
  scope?: string;

  @Field(() => String, { nullable: true })
  password?: string;
}
