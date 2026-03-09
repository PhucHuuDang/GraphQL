import { Field, ObjectType } from '@nestjs/graphql';

import { OptionalStringField } from '../../../common/decorators/field.decorators';
import { AccountModel } from '../../../common/models/account.model';
import { BaseModel } from '../../../common/models/base.model';
import { Comment } from '../../../common/models/comment.model';
import { LikeModel } from '../../../common/models/like.model';
import { SessionModel } from '../../../common/models/session.model';

@ObjectType()
export class UserModel extends BaseModel {
  @OptionalStringField()
  name?: string;

  @OptionalStringField()
  email?: string;

  @OptionalStringField()
  image?: string;

  @Field(() => String, { nullable: true })
  designation?: string;

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
