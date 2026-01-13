import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUser {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  password: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  email?: string;
}
