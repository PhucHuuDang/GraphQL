import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PostModel } from './post/post.model';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class Author {
  @Field((type) => String)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  designation?: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field(() => Boolean, { nullable: true })
  verified: boolean;

  @Field((type) => [PostModel])
  posts: PostModel[];

  @Field({ defaultValue: false, nullable: true })
  isActive?: boolean;
  @Field({ defaultValue: false, nullable: true })
  isVerified?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isDeleted?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isSuspended?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isLocked?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isExpired?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isBlocked?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  socialLinks?: Record<string, string>;

  // @Field({ nullable: true, defaultValue: new Date() })
  // createdAt?: Date | null;

  // @Field({ nullable: true })
  // updatedAt?: Date | null;
}
