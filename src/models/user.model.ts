import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Comment } from './comment.model';
import { Like } from './like.model';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  email: string;

  @Field(() => [Comment], { nullable: true })
  comments: Comment[];

  @Field(() => [Like], { nullable: true })
  likes: Like[];
}
