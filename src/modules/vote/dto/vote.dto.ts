import { InputType } from '@nestjs/graphql';

import { EnumField, StringField } from '../../../common/decorators/field.decorators';
import { VoteTypeEnum } from '../models/vote.model';

/**
 * Input DTO for casting a vote
 */
@InputType()
export class CastVoteInput {
  @StringField({ description: 'Post ID to vote on' })
  postId: string;

  @EnumField(VoteTypeEnum, { description: 'Vote type: UPVOTE or DOWNVOTE' })
  value: VoteTypeEnum;
}
