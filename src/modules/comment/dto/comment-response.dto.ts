import { ObjectType } from '@nestjs/graphql';

import {
  ArrayResponse,
  DeleteResponse,
  SingleResponse,
} from '../../../common/types/response.types';
import { CommentModel } from '../models/comment.model';

@ObjectType()
export class CommentResponse extends SingleResponse(CommentModel) {}

@ObjectType()
export class CommentsResponse extends ArrayResponse(CommentModel) {}

@ObjectType()
export class DeleteCommentResponse extends DeleteResponse {}
