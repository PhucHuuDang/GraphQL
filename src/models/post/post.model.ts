import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Post {
  @Field(() => String)
  id: string;

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

  @Field(() => String)
  authorId: string;

  @Field(() => String, { nullable: true })
  categoryId?: string;
}

@InputType()
export class PostPaginationInput {
  @Field(() => Int, { nullable: true })
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  limit?: number = 10;

  @Field(() => GraphQLJSON, { nullable: true })
  extra?: Record<string, any>;
}
