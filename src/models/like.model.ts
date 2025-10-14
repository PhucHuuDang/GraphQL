import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Like {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  user: User;
}
