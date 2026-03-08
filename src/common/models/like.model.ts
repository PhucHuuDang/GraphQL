import { Field, Int, ObjectType } from '@nestjs/graphql';

import { BaseTimestampModelWithIntId } from './base.model';

@ObjectType()
export class LikeModel extends BaseTimestampModelWithIntId {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;
}
