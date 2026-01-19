import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  ObjectField,
  OptionalObjectField,
  StringField,
} from '../../common/decorators/field.decorators';
import { BaseModel } from '../../models/base.model';
import { UserModel } from '../../models/user.model';
import { CategoryModel } from '../category/category.model';

@ObjectType()
export class PostModel extends BaseModel {
  @Field()
  title: string;

  @Field({ nullable: true })
  mainImage?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON)
  content: JSON;

  @Field(() => Int)
  views: number;

  @Field(() => Int)
  votes: number;

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

  @Field({ defaultValue: false })
  isDeleted: boolean;

  // @Field(() => String, { nullable: true })

  @StringField({
    description: 'Category ID of the post',
  })
  categoryId: string;

  // @Field(() => UserModel)

  @StringField({
    description: 'Category ID of the post',
  })
  authorId: string;

  @ObjectField(() => UserModel, {
    description: 'Author of the post',
  })
  author: UserModel;

  @Field(() => CategoryModel, { nullable: true })
  category?: CategoryModel;
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
