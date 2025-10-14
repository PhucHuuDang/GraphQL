import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Author } from './author.model';
import { Comment } from './comment.model';
import { Category } from './category.model';
import { Like } from './like.model';

@ObjectType()
export class Post {
  @Field((type) => Int)
  id: number;

  @Field()
  title: string;

  @Field((type) => Int, { nullable: true })
  votes: number;

  @Field(() => Author)
  author: Author;

  @Field(() => Category, { nullable: true })
  category: Category;

  @Field(() => [Comment], { nullable: true })
  comments: Comment[];

  @Field(() => [Like], { nullable: true })
  likes: Like[];
}
