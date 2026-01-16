import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PostModel } from '../modules/post/post.model';

import { UserModel } from './user.model';

@ObjectType()
export class LikeModel {
  @Field(() => Int)
  id: number;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;

  @Field(() => PostModel)
  post: PostModel;

  @Field(() => Date)
  createdAt: Date;
}
