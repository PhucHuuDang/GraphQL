import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PostModel } from '../modules/post/post.model';

import { BaseTimestampModelWithIntId } from './base.model';
import { UserModel } from './user.model';

@ObjectType()
export class Comment extends BaseTimestampModelWithIntId {
  @Field()
  content: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => PostModel, { nullable: true })
  post: PostModel | null;
}
