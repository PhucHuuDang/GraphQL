import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Session {
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

  @Field(() => User)
  user: User;
}
