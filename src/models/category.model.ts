import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post/post.model';
import { IsArray, IsDate, IsString } from 'class-validator';

@ObjectType()
export class Category {
  @Field(() => String)
  @IsString()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => [Post], { nullable: true })
  @IsArray()
  posts?: Post[];

  // @Field({ nullable: true })
  // @IsDate()
  // createdAt?: Date;

  // @Field({ nullable: true })
  // @IsDate()
  // updatedAt?: Date | null;
}
