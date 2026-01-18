import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';

import { EnumField } from '../common/decorators/field.decorators';
import { UserRole } from '../common/registers/register-all-enums.example';

import { AccountModel } from './account.model';
import { Comment } from './comment.model';
import { LikeModel } from './like.model';
import { SessionModel } from './session.model';

@ObjectType()
export class UserModel {
  @Field(() => String)
  id: string;

  @Field((type) => String, { nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  designation?: string;

  // @EnumField(() => UserRole, { nullable: true })
  // role?: UserRole;

  @Field(() => [Comment], { defaultValue: [] })
  comments: Comment[];

  @Field(() => [LikeModel], { defaultValue: [] })
  likes: LikeModel[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Boolean, { defaultValue: false })
  emailVerified: boolean;

  @Field(() => [SessionModel], { defaultValue: [] })
  sessions: SessionModel[];

  @Field(() => [AccountModel], { defaultValue: [] })
  accounts: AccountModel[];
}
