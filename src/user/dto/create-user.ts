import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUser {
  @Field()
  name: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  email?: string;
}
