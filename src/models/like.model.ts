import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PostModel } from '../modules/post/post.model';

import { BaseTimestampModelWithIntId } from './base.model';
import { UserModel } from './user.model';

@ObjectType()
export class LikeModel extends BaseTimestampModelWithIntId {
  @Field(() => UserModel)
  user: UserModel;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;

  @Field(() => PostModel)
  post: PostModel;
}
