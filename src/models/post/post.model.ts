import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  mainImage?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON) // hoặc (() => GraphQLJSON) nếu content là JSON
  content: JSON;

  @Field(() => Int)
  votes: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [String])
  tags: string[];

  @Field(() => String)
  slug: string;

  @Field({ defaultValue: false })
  isPublished: boolean;

  @Field({ defaultValue: false })
  isPriority: boolean;

  @Field({ defaultValue: false })
  isPinned: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;
}
