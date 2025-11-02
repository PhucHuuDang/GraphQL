import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsJSON()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
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
