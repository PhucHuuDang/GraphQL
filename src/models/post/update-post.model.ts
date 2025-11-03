import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
} from 'class-validator';
import { InputJsonValue } from 'generated/prisma/runtime/library';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdatePost {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

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
  @IsString({ each: true })
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

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  votes?: number;
}
