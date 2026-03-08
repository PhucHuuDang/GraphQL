import { Field, Int, ObjectType } from '@nestjs/graphql';

import { BaseTimestampModelWithIntId } from './base.model';

@ObjectType()
export class Comment extends BaseTimestampModelWithIntId {
  @Field()
  content: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  postId?: string;
}
