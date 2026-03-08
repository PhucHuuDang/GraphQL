import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { ObjectField, StringField } from '../../../common/decorators/field.decorators';
import { BaseModel } from '../../../common/models/base.model';
import { CategoryModel } from '../../category/models/category.model';
import { UserModel } from '../../user/models/user.model';

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

  @StringField({
    description: 'Category ID of the post',
  })
  categoryId: string;

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
