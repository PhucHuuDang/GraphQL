import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Prisma, Vote, VoteType } from '../../../generated/prisma';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { GraphQLContext } from '../../common/interfaces/graphql-context.interface';
import { BaseRepository } from '../../core/database/base.repository';
import { PrismaService } from '../../core/database/prisma.service';

import { CastVoteInput } from './dto/vote.dto';

@Injectable()
export class VoteService extends BaseRepository<Vote, Prisma.VoteDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma, 'vote', 'VoteService');
  }

  /**
   * Get authenticated user from context
   */
  private getAuthenticatedUser(context: GraphQLContext) {
    const session = context.req['session'];
    if (!session || !session.user) {
      throw new UnauthorizedException('You must be logged in to perform this action');
    }
    return session.user;
  }

  /**
   * Cast or change a vote (idempotent upsert)
   * - If user hasn't voted: create vote
   * - If user voted same way: remove vote (toggle off)
   * - If user voted differently: change vote
   */
  async castVote(input: CastVoteInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      // Verify post exists
      const post = await this.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post || post.isDeleted) {
        return ResponseHelper.notFound('Post');
      }

      // Check for existing vote
      const existingVote = await this.findOne({
        userId: user.id,
        postId: input.postId,
      });

      if (existingVote) {
        if (existingVote.value === (input.value as unknown as VoteType)) {
          // Same vote — toggle off (remove vote)
          await this.delete({ where: { id: existingVote.id } });
          return ResponseHelper.success({ ...existingVote, value: null }, 'Vote removed');
        }

        // Different vote — change it
        const updated = await this.update(existingVote.id, {
          data: { value: input.value as unknown as VoteType },
        });

        return ResponseHelper.success(updated, 'Vote changed successfully');
      }

      // No existing vote — create new
      const vote = await this.create({
        user: { connect: { id: user.id } },
        post: { connect: { id: input.postId } },
        value: input.value as unknown as VoteType,
      });

      return ResponseHelper.success(vote, 'Vote cast successfully');
    } catch (error: any) {
      this.logger.error('Failed to cast vote', error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      return ResponseHelper.error(
        error?.message || 'Failed to cast vote',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Remove a vote (explicit removal)
   */
  async removeVote(postId: string, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      const existingVote = await this.findOne({
        userId: user.id,
        postId,
      });

      if (!existingVote) {
        return ResponseHelper.notFound('Vote');
      }

      await this.delete({ where: { id: existingVote.id } });

      return ResponseHelper.successDelete(existingVote.id, 'Vote removed successfully');
    } catch (error: any) {
      this.logger.error('Failed to remove vote', error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      return ResponseHelper.error(
        error?.message || 'Failed to remove vote',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Get vote status for a post (aggregate counts + user's vote)
   */
  async getVoteStatus(postId: string, context: GraphQLContext) {
    try {
      const session = context.req['session'];
      const userId = session?.user?.id;

      const [upvotes, downvotes, userVote] = await Promise.all([
        this.count({ postId, value: VoteType.UPVOTE }),
        this.count({ postId, value: VoteType.DOWNVOTE }),
        userId ? this.findOne({ userId, postId }) : Promise.resolve(null),
      ]);

      return ResponseHelper.success(
        {
          userVote: userVote?.value || null,
          upvotes,
          downvotes,
          score: upvotes - downvotes,
        },
        'Vote status retrieved',
      );
    } catch (error: any) {
      this.logger.error(`Failed to get vote status for post ${postId}`, error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve vote status',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }
}
