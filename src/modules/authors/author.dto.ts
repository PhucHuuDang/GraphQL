import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateAuthor {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  designation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  role?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isExpired?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  socialLinks?: Record<string, string>;
}

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  @IsString()
  currentPassword: string;

  @Field(() => String)
  @IsString()
  newPassword: string;

  // @Field(() => Boolean, { nullable: true })
  // @IsOptional()
  // @IsBoolean()
  // revokeOtherSessions?: boolean;
}
