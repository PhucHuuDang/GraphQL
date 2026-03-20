import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { BaseModel } from '../../../common/models/base.model';
import { UserModel } from '../../user/models/user.model';

/**
 * Vote type enum matching Prisma VoteType
 */
export enum VoteTypeEnum {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

registerEnumType(VoteTypeEnum, {
  name: 'VoteType',
  description: 'Type of vote (UPVOTE or DOWNVOTE)',
});

@ObjectType()
export class VoteModel extends BaseModel {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;

  @Field(() => VoteTypeEnum)
  value: VoteTypeEnum;

  @Field(() => UserModel, { nullable: true })
  user?: UserModel;
}

/**
 * Vote status response — returns current vote state for a post
 */
@ObjectType()
export class VoteStatusModel {
  @Field(() => VoteTypeEnum, { nullable: true })
  userVote?: VoteTypeEnum;

  @Field(() => Number)
  upvotes: number;

  @Field(() => Number)
  downvotes: number;

  @Field(() => Number)
  score: number;
}
