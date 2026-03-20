import { UseGuards } from '@nestjs/common';

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DeleteOperation, SingleItem } from '../../common/decorators/response.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';

import { CastVoteInput } from './dto/vote.dto';
import { RemoveVoteResponse, VoteResponse, VoteStatusResponse } from './dto/vote-response.dto';
import { VoteModel } from './models/vote.model';
import { VoteService } from './vote.service';

import type { GraphQLContext } from '../../common/interfaces/graphql-context.interface';

/**
 * GraphQL Resolver for Vote operations
 * Handles voting (upvote/downvote) on posts
 */
@Resolver(() => VoteModel)
export class VoteResolver {
  constructor(private readonly voteService: VoteService) {}

  // ==================== Queries ====================

  /**
   * Get vote status for a post
   * Returns aggregate counts and the current user's vote (if authenticated)
   */
  @SingleItem('Vote status retrieved')
  @Query(() => VoteStatusResponse, {
    name: 'voteStatus',
    description: 'Get vote counts and current user vote for a post',
  })
  async getVoteStatus(
    @Args('postId', { type: () => String }) postId: string,
    @Context() context: GraphQLContext,
  ) {
    return await this.voteService.getVoteStatus(postId, context);
  }

  // ==================== Mutations ====================

  /**
   * Cast or toggle a vote
   * - First click: upvote/downvote
   * - Same click again: removes vote (toggle)
   * - Different click: changes vote direction
   */
  @SingleItem('Vote cast successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => VoteResponse, {
    description: 'Cast a vote on a post (toggle behavior)',
  })
  async castVote(@Args('input') input: CastVoteInput, @Context() context: GraphQLContext) {
    return await this.voteService.castVote(input, context);
  }

  /**
   * Explicitly remove a vote
   */
  @DeleteOperation('Vote removed successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => RemoveVoteResponse, {
    description: 'Remove your vote from a post',
  })
  async removeVote(
    @Args('postId', { type: () => String }) postId: string,
    @Context() context: GraphQLContext,
  ) {
    return await this.voteService.removeVote(postId, context);
  }
}
