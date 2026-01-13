import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { PostModel } from '../modules/post/post.model';

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
