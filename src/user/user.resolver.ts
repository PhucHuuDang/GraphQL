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
import { Request, Response } from 'express';

import { User } from 'better-auth';
import {
  GitHubUserResponse,
  SignInEmailUser,
  SignUpEmailUser,
} from 'src/models/auth.model';
import { SignInInput, SignUpInput } from 'src/dto/user.dto';
import { ChangePasswordInput } from 'src/authors/author.dto';

@AllowAnonymous()
@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [AccountModel])
  async getAccounts(@Context() context: { req: Request }) {
    const test = await this.userService.getAccounts(context.req);
    console.log({ test });
    return test;
  }

  @Mutation((type) => SignUpEmailUser)
  async signUpEmail(
    @Args('signUpInput') signUpInput: SignUpInput,
    @Context() ctx: { req: Request; res: Response },
  ) {
    const { email, password, name, image, callbackURL, rememberMe } =
      signUpInput;

    const response = await this.userService.signUpEmail(signUpInput);

    console.log({ response });

    ctx.res.cookie('test-token', response.token, {
      // secure: true,
      // httpOnly: true
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return response;
  }

  @Mutation(() => SignInEmailUser)
  async signInEmail(
    @Args('signInInput') signInInput: SignInInput,
    @Context() ctx: { req: Request; res: Response },
  ) {
    const response = await this.userService.signInEmail(signInInput, ctx.req);

    if ('errors' in response) {
      console.log('Auth error:', response.errors);
      return response;
    }

    if ('token' in response) {
      ctx.res.cookie('blog-access-token', response.token, {
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 3600 * 1000,
      });
    }

    return response;
  }

  @Mutation(() => Boolean)
  async changePassword(
    @Args('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @Context() ctx: { req: Request },
  ) {
    const response = await this.userService.changePassword(
      changePasswordInput,
      ctx.req,
    );
    return response;
  }

  @Mutation(() => Boolean)
  async signOut(@Context() ctx: { req: Request }) {
    const response = await this.userService.signOut(ctx.req);
    return response;
  }

  @Mutation(() => GitHubUserResponse)
  async gitHub(@Context() ctx: { req: Request }) {
    const response = await this.userService.gitHub(ctx.req);

    console.log('cookies before redirect:', ctx.req.headers.cookie);

    console.log({ response });

    return response;
  }

  @Mutation(() => UserModel)
  createUser(@Args('createUserInput') createUserInput: CreateUser) {
    return this.userService.create(createUserInput);
  }
}
