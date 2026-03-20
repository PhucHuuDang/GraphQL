import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '../../../common/models/base.model';
import { UserModel } from '../../user/models/user.model';

@ObjectType()
export class CommentModel extends BaseModel {
  @Field()
  content: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  postId?: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isEdited: boolean;

  @Field(() => UserModel, { nullable: true })
  user?: UserModel;

  @Field(() => [CommentModel], { defaultValue: [] })
  replies?: CommentModel[];
}
