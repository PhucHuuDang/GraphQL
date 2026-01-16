import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PostModel } from '../modules/post/post.model';

import { UserModel } from './user.model';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => PostModel, { nullable: true })
  post: PostModel | null;

  @Field()
  createdAt: Date;
}
