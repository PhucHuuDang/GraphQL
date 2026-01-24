import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';

import { EnumField, OptionalStringField } from '../common/decorators/field.decorators';
import { UserRole } from '../common/registers/register-all-enums.example';

import { AccountModel } from './account.model';
import { BaseModel } from './base.model';
import { Comment } from './comment.model';
import { LikeModel } from './like.model';
import { SessionModel } from './session.model';

@ObjectType()
export class UserModel extends BaseModel {
  @Field((type) => String, { nullable: true })
  name?: string;

  // @Field(() => String, { nullable: true })

  @OptionalStringField()
  email?: string;

  // @Field(() => String, { nullable: true })
  @OptionalStringField()
  image?: string;

  @Field(() => String, { nullable: true })
  designation?: string;

  // @EnumField(() => UserRole, { nullable: true })
  // role?: UserRole;

  @Field(() => [Comment], { defaultValue: [] })
  comments: Comment[];

  @Field(() => [LikeModel], { defaultValue: [] })
  likes: LikeModel[];

  @Field(() => Boolean, { defaultValue: false })
  emailVerified: boolean;

  @Field(() => [SessionModel], { defaultValue: [] })
  sessions: SessionModel[];

  @Field(() => [AccountModel], { defaultValue: [] })
  accounts: AccountModel[];
}
