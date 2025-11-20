import { ObjectType, Field, Int, PickType, InputType } from '@nestjs/graphql';
import { Comment } from './comment.model';
import { LikeModel } from './like.model';
import { SessionModel } from './session.model';
import { AccountModel } from './account.model';

@ObjectType()
export class UserModel {
  @Field(() => String)
  id: string;

  @Field((type) => String, { nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => [Comment], { defaultValue: [] })
  comments: Comment[];

  @Field(() => [LikeModel], { defaultValue: [] })
  likes: LikeModel[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Boolean, { defaultValue: false })
  emailVerified: boolean;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => [SessionModel], { defaultValue: [] })
  sessions: SessionModel[];

  @Field(() => [AccountModel], { defaultValue: [] })
  accounts: AccountModel[];
}
