import { InputType } from '@nestjs/graphql';

import { OptionalStringField, StringField } from '../../../common/decorators/field.decorators';

/**
 * Input DTO for creating a new comment
 */
@InputType()
export class CreateCommentInput {
  @StringField({
    description: 'Comment content',
    minLength: 1,
    maxLength: 5000,
    validationOptions: { message: 'Comment must be between 1-5000 characters' },
  })
  content: string;

  @StringField({ description: 'Post ID to comment on' })
  postId: string;

  @OptionalStringField({ description: 'Parent comment ID for replies' })
  parentId?: string;
}

/**
 * Input DTO for updating an existing comment
 */
@InputType()
export class UpdateCommentInput {
  @StringField({
    description: 'Updated comment content',
    minLength: 1,
    maxLength: 5000,
    validationOptions: { message: 'Comment must be between 1-5000 characters' },
  })
  content: string;
}
