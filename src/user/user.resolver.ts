import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from 'src/models/user.model';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';

import {
  type UserSession,
  type BaseUserSession,
  Session,
  AllowAnonymous,
} from '@thallesp/nestjs-better-auth';

import { SessionModel } from 'src/models/session.model';
import { AccountModel } from 'src/models/account.model';
import { Request } from 'express';

@AllowAnonymous()
@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel, { name: 'profile' })
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Query(() => UserModel)
  getSession(@Session() session: UserSession) {
    console.log({ session });
    return { session: session.user };
  }

  @Mutation(() => UserModel)
  async signUpEmail(
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('image', { type: () => String, nullable: true }) image?: string,
    @Args('callbackURL', { type: () => String, nullable: true })
    callbackURL?: string,
    @Args('rememberMe', { type: () => Boolean, nullable: true })
    rememberMe?: boolean,
  ) {
    return this.userService.signUpEmail(
      email,
      password,
      name,
      image,
      callbackURL,
      rememberMe,
    );
  }

  @Query(() => [AccountModel])
  async getAccounts(@Context() context: { req: Request }) {
    const test = await this.userService.getAccounts(context.req);
    console.log({ test });
    return test;
  }

  @Mutation(() => UserModel)
  createUser(@Args('createUserInput') createUserInput: CreateUser) {
    return this.userService.create(createUserInput);
  }
}
