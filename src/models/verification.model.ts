import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerificationModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  identifier: string;

  @Field(() => String)
  value: string;
  @Field(() => Date)
  expiresAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
