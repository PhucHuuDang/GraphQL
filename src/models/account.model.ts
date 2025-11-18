import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class AccountModel {
  @Field(() => String)
  id: string;

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

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
