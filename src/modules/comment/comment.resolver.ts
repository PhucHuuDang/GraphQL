import { UseGuards } from '@nestjs/common';

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  ArrayItems,
  DeleteOperation,
  SingleItem,
} from '../../common/decorators/response.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';

import { CreateCommentInput, UpdateCommentInput } from './dto/comment.dto';
import {
  CommentResponse,
  CommentsResponse,
  DeleteCommentResponse,
} from './dto/comment-response.dto';
import { CommentModel } from './models/comment.model';
import { CommentService } from './comment.service';

import type { GraphQLContext } from '../../common/interfaces/graphql-context.interface';

/**
 * GraphQL Resolver for Comment operations
 * Handles CRUD operations for post comments with threaded replies
 */
@Resolver(() => CommentModel)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  // ==================== Queries ====================

  /**
   * Get comments for a specific post
   */
  @ArrayItems('Comments retrieved successfully')
  @Query(() => CommentsResponse, {
    name: 'commentsByPost',
    description: 'Get all comments for a post (with nested replies)',
  })
  async getCommentsByPost(@Args('postId', { type: () => String }) postId: string) {
    return await this.commentService.getCommentsByPost(postId);
  }

  // ==================== Mutations ====================

  /**
   * Create a new comment
   * Requires authentication
   */
  @SingleItem('Comment created successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => CommentResponse, {
    description: 'Create a comment on a post (requires authentication)',
  })
  async createComment(
    @Args('input') input: CreateCommentInput,
    @Context() context: GraphQLContext,
  ) {
    return await this.commentService.createComment(input, context);
  }

  /**
   * Update an existing comment
   * Requires authentication and ownership
   */
  @SingleItem('Comment updated successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => CommentResponse, {
    description: 'Update a comment (requires ownership)',
  })
  async updateComment(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateCommentInput,
    @Context() context: GraphQLContext,
  ) {
    return await this.commentService.updateComment(id, input, context);
  }

  /**
   * Delete a comment (soft delete)
   * Requires authentication and ownership
   */
  @DeleteOperation('Comment deleted successfully')
  @UseGuards(AuthGuard)
  @Mutation(() => DeleteCommentResponse, {
    description: 'Delete a comment (requires ownership)',
  })
  async deleteComment(
    @Args('id', { type: () => String }) id: string,
    @Context() context: GraphQLContext,
  ) {
    return await this.commentService.deleteComment(id, context);
  }
}
