import { ObjectType } from '@nestjs/graphql';
import { PostModel } from '../post.model';
import {
  ArrayResponse,
  DeleteResponse,
  PaginatedResponse,
  SingleResponse,
} from '../../../common/types/response.types';

/**
 * Paginated posts response
 */
@ObjectType()
export class PaginatedPostsResponse extends PaginatedResponse(PostModel) {}

/**
 * Single post response
 */
@ObjectType()
export class PostResponse extends SingleResponse(PostModel) {}

/**
 * Multiple posts response (non-paginated)
 */
@ObjectType()
export class PostsArrayResponse extends ArrayResponse(PostModel) {}

/**
 * Delete post response
 */
@ObjectType()
export class DeletePostResponse extends DeleteResponse {}
