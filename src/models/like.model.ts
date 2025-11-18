import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { PostModel } from './post/post.model';

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
