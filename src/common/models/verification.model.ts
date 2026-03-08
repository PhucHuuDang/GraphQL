import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from './base.model';

@ObjectType()
export class VerificationModel extends BaseModel {
  @Field(() => String)
  identifier: string;

  @Field(() => String)
  value: string;

  @Field(() => Date)
  expiresAt: Date;
}
