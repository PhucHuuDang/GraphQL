import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PostModel } from '../modules/post/post.model';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { isNullableType } from 'graphql';

@ObjectType()
export class CategoryModel {
  @Field(() => String)
  @IsString()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => [PostModel], { nullable: true })
  @IsArray()
  posts?: PostModel[];

  @Field()
  @IsDate()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt: Date | null;
}
