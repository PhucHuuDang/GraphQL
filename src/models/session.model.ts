import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from './base.model';
import { UserModel } from './user.model';

@ObjectType()
export class SessionModel extends BaseModel {
  @Field(() => Date)
  expiresAt: Date;

  @Field(() => String)
  token: string;

  @Field(() => String)
  ipAddress: string;

  @Field(() => String)
  userAgent: string;

  @Field(() => String)
  userId: string;

  @Field(() => UserModel)
  user: UserModel;
}
