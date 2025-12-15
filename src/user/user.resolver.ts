import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';

import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { AccountModel } from '../models/account.model';
import { Request, Response } from 'express';

import { User } from 'better-auth';
import {
  GetProfileResponse,
  GetSessionResponse,
  GitHubUserResponse,
  SignInEmailUser,
  SignOutResponse,
  SignUpEmailUser,
} from '../models/auth.model';
import { SignInInput, SignUpInput } from '../dto/user.dto';
import { ChangePasswordInput } from '../authors/author.dto';

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

  @Query(() => GetProfileResponse)
  async getProfile(@Context() context: { req: Request }) {
    const response = await this.userService.getProfile(context.req);
    console.log({ response });
    return response;
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

    // ctx.res.cookie('devs.session_token', response.token, {
    //   secure: process.env.NODE_ENV === 'production',
    //   httpOnly: true,
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 7 * 24 * 3600 * 1000,
    // });

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
      ctx.res.cookie('devs.session_token', response.token, {
        httpOnly: true,
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        sameSite: 'lax',
        path: '/',
        maxAge: signInInput.rememberMe
          ? 30 * 24 * 3600 * 1000
          : 7 * 24 * 3600 * 1000, // 30 ngày vs 7 ngày

        secure: false,
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

  @Mutation(() => SignOutResponse)
  async signOut(@Context() ctx: { req: Request; res: Response }) {
    const response = await this.userService.signOut(ctx.req);

    if (response.success) {
      ctx.res.clearCookie('devs.session_token');
    }

    return response;
  }

  @Mutation(() => GitHubUserResponse)
  async gitHub(@Context() ctx: { req: Request }) {
    const response = await this.userService.gitHub(ctx.req);

    console.log('cookies before redirect:', ctx.req.headers.cookie);

    return response;
  }

  @Mutation(() => UserModel)
  createUser(@Args('createUserInput') createUserInput: CreateUser) {
    return this.userService.create(createUserInput);
  }

  @Query(() => GetSessionResponse)
  async getSession(@Context() ctx: { req: Request }) {
    console.log(ctx.req);
    const response = await this.userService.getSession(ctx.req);

    console.log({ response });
    return response;
  }
}
