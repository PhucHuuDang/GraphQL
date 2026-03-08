import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  content?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPriority?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  authorId?: number;
}
