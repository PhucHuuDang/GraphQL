import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post/post.model';

@ObjectType()
export class Author {
  @Field((type) => Int)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field(() => Boolean, { nullable: true })
  verified: boolean;

  @Field((type) => [Post])
  posts: Post[];
}
