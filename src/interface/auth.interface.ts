import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class UserResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  image: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@InterfaceType()
export abstract class GitHubUserResponse {
  @Field(() => String)
  redirect: string;

  @Field(() => String)
  token: string;

  @Field(() => String)
  url: string;

  user: UserResponse;
}
