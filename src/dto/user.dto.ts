import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignUpInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  callbackURL?: string;

  @Field({ nullable: true })
  rememberMe?: boolean;
}

@InputType()
export class SignInInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => Boolean, { nullable: true })
  rememberMe?: boolean;

  @Field(() => String, { nullable: true })
  callbackURL?: string;
}
