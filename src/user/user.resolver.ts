import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';

import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { AccountModel } from '../models/account.model';

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
import type { GraphQLContext } from '../common/graphql.context';

@AllowAnonymous()
@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [AccountModel])
  async getAccounts(@Context() context: GraphQLContext) {
    const test = await this.userService.getAccounts(context);
    console.log({ test });
    return test;
  }

  @Query(() => GetProfileResponse)
  async getProfile(@Context() context: GraphQLContext) {
    const response = await this.userService.getProfile(context);
    console.log({ response });
    return response;
  }

  @Mutation((type) => SignUpEmailUser)
  async signUpEmail(
    @Args('signUpInput') signUpInput: SignUpInput,
    @Context() ctx: GraphQLContext,
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
    @Context() ctx: GraphQLContext,
  ) {
    const response = await this.userService.signInEmail(signInInput, ctx);

    if ('errors' in response) {
      console.log('Auth error:', response.errors);
      return response;
    }

    if ('token' in response) {
      ctx.res
        .switchToHttp()
        .getResponse()
        .cookie('devs.session_token', response.token, {
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
    @Context() ctx: GraphQLContext,
  ) {
    const { currentPassword, newPassword } = changePasswordInput;

    if (!currentPassword || !newPassword) {
      return {
        error: 'Current password and new password are required',
        statusCode: 400,
      };
    }

    const response = await this.userService.changePassword(
      changePasswordInput,
      ctx,
    );
    return response;
  }

  @Mutation(() => SignOutResponse)
  async signOut(@Context() ctx: GraphQLContext) {
    const response = await this.userService.signOut(ctx);

    if (response.success) {
      ctx.res.switchToHttp().getResponse().clearCookie('devs.session_token');
    }

    return response;
  }

  @Mutation(() => GitHubUserResponse)
  async gitHub(@Context() ctx: GraphQLContext) {
    const response = await this.userService.gitHub(ctx);

    console.log('cookies before redirect:', ctx.req.headers.cookie);

    return response;
  }

  @Mutation(() => UserModel)
  createUser(@Args('createUserInput') createUserInput: CreateUser) {
    return this.userService.create(createUserInput);
  }

  @Query(() => GetSessionResponse)
  async getSession(@Context() ctx: GraphQLContext) {
    console.log(ctx.req);
    const response = await this.userService.getSession(ctx);

    console.log({ response });
    return response;
  }
}
