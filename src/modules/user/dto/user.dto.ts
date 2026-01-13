import { ArgsType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignUpInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  callbackURL?: string;

  @Field(() => Boolean, { nullable: true })
  rememberMe?: boolean;
}

@InputType()
export class SignInInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => Boolean, { nullable: true })
  rememberMe?: boolean;

  @Field(() => String, { nullable: true })
  callbackURL?: string;
}

@ArgsType()
export class UpdateProfileArgs {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  password: string;

  @Field(() => Boolean, { nullable: true })
  rememberMe?: boolean;
}
