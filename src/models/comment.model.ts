import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from './user.model';
import { Post } from './post.model';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field(() => Post, { nullable: true })
  post: Post | null;

  @Field()
  createdAt: Date;
}
