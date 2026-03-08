import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from '../../modules/user/models/user.model';

import { BaseModel } from './base.model';

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
