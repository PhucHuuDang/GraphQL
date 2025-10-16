import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { CreateUser } from './create-user';
import { User } from 'src/models/user.model';

@InputType()
export class UpdateUser extends PartialType(User) {
  @Field(() => Int)
  id: number;
}
