import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { CreateUser } from './create-user.js';
import { UserModel } from '../../models/user.model.js';

@InputType()
export class UpdateUser extends PartialType(UserModel) {
  @Field(() => String)
  id: string;
}
