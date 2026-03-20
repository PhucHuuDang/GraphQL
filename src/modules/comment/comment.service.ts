import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Comment, Prisma } from '../../../generated/prisma';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { GraphQLContext } from '../../common/interfaces/graphql-context.interface';
import { BaseRepository } from '../../core/database/base.repository';
import { PrismaService } from '../../core/database/prisma.service';

import { CreateCommentInput, UpdateCommentInput } from './dto/comment.dto';

@Injectable()
export class CommentService extends BaseRepository<Comment, Prisma.CommentDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma, 'comment', 'CommentService');
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
   * Create a new comment on a post
   */
  async createComment(input: CreateCommentInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      // Verify post exists
      const post = await this.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post || post.isDeleted) {
        return ResponseHelper.notFound('Post');
      }

      // If replying to a comment, verify parent exists
      if (input.parentId) {
        const parentComment = await this.findById(input.parentId);
        if (!parentComment || parentComment.isDeleted) {
          return ResponseHelper.notFound('Parent comment');
        }
      }

      const comment = await this.create(
        {
          content: input.content,
          user: { connect: { id: user.id } },
          post: { connect: { id: input.postId } },
          ...(input.parentId && {
            parent: { connect: { id: input.parentId } },
          }),
        },
        {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      );

      return ResponseHelper.success(comment, 'Comment created successfully');
    } catch (error: any) {
      this.logger.error('Failed to create comment', error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }

      return ResponseHelper.error(
        error?.message || 'Failed to create comment',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Update a comment (only owner can update)
   */
  async updateComment(id: string, input: UpdateCommentInput, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      const comment = await this.findByIdOrFail(id);

      if (comment.userId !== user.id) {
        throw new ForbiddenException('You can only edit your own comments');
      }

      if (comment.isDeleted) {
        return ResponseHelper.error('Comment has been deleted', 'NOT_FOUND');
      }

      const updated = await this.update(id, {
        data: {
          content: input.content,
          isEdited: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return ResponseHelper.success(updated, 'Comment updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update comment ${id}`, error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }
      if (error instanceof ForbiddenException) {
        return ResponseHelper.forbidden(error.message);
      }
      if (error instanceof NotFoundException) {
        return ResponseHelper.notFound('Comment');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to update comment',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Delete a comment (soft delete, only owner can delete)
   */
  async deleteComment(id: string, context: GraphQLContext) {
    try {
      const user = this.getAuthenticatedUser(context);

      const comment = await this.findByIdOrFail(id);

      if (comment.userId !== user.id) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      await this.softDelete(id);

      return ResponseHelper.successDelete(id, 'Comment deleted successfully');
    } catch (error: any) {
      this.logger.error(`Failed to delete comment ${id}`, error?.stack);

      if (error instanceof UnauthorizedException) {
        return ResponseHelper.unauthorized(error.message);
      }
      if (error instanceof ForbiddenException) {
        return ResponseHelper.forbidden(error.message);
      }
      if (error instanceof NotFoundException) {
        return ResponseHelper.notFound('Comment');
      }

      return ResponseHelper.error(
        error?.message || 'Failed to delete comment',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }

  /**
   * Get comments for a post (top-level only, with replies nested)
   */
  async getCommentsByPost(postId: string) {
    try {
      const comments = await this.findAll({
        where: {
          postId,
          parentId: null, // Only top-level comments
          isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return ResponseHelper.successArray(comments, 'Comments retrieved successfully');
    } catch (error: any) {
      this.logger.error(`Failed to get comments for post ${postId}`, error?.stack);
      return ResponseHelper.error(
        error?.message || 'Failed to retrieve comments',
        error?.code || 'INTERNAL_ERROR',
      );
    }
  }
}
