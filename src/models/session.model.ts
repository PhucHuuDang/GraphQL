import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from './user.model';

@ObjectType()
export class SessionModel {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  expiresAt: Date;

  @Field(() => String)
  token: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  ipAddress: string;

  @Field(() => String)
  userAgent: string;

  @Field(() => String)
  userId: string;

  @Field(() => UserModel)
  user: UserModel;
}
