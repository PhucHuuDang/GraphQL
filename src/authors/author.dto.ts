import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateAuthor {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  designation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isExpired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  socialLinks?: Record<string, string>;
}
