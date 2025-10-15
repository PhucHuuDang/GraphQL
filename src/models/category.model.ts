import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class Category {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [Post], { nullable: true })
  posts: Post[];
}
