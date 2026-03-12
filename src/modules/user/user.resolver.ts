import { Args, Context, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { RawResponse, SingleItem } from '../../common/decorators/response.decorators';
import { AccountModel } from '../../common/models/account.model';
import { SingleResponse } from '../../common/types/response.types';

import { SignInInput, SignUpInput, UpdateProfileArgs } from './dto/user.dto';
import { UserModel } from './models/user.model';
import {
  GetProfileResponse,
  GetSessionResponse,
  GitHubUserResponse,
  OAuth2UserInfoModel,
  SignInEmailUser,
  SignOutResponse,
  SignUpEmailUser,
} from './auth.model';
import { UserService } from './user.service';

import type { GraphQLContext } from '../../common/interfaces/graphql-context.interface';

@ObjectType()
export class SessionSingleResponse extends SingleResponse(GetSessionResponse) {}

@ObjectType()
export class SingleProfileResponse extends SingleResponse(OAuth2UserInfoModel) {}

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [AccountModel])
  async getAccounts(@Context() context: GraphQLContext) {
    const test = await this.userService.getAccounts(context);
    return test;
  }

  @Query(() => SingleProfileResponse)
  async getProfile(@Context() context: GraphQLContext) {
    const response = await this.userService.getProfile(context);
    return response;
  }

  @Mutation(() => UserModel)
  async updateProfile(@Args() args: UpdateProfileArgs, @Context() context: GraphQLContext) {
    const response = await this.userService.updateProfile(args, context);
    return response;
  }

  @RawResponse()
  @Mutation((type) => SignUpEmailUser, { description: 'Sign up email user' })
  async signUpEmail(
    @Args('signUpInput', { type: () => SignUpInput }) signUpInput: SignUpInput,
    @Context() ctx: GraphQLContext,
  ) {
    const response = await this.userService.signUpEmail(signUpInput, ctx);

    console.log('Sign up email response: ', response);
    return response;
  }

  @RawResponse()
  @Mutation(() => SignInEmailUser)
  async signInEmail(
    @Args('signInInput', { type: () => SignInInput }) signInInput: SignInInput,
    @Context() ctx: GraphQLContext,
  ) {
    const response = await this.userService.signInEmail(signInInput, ctx);

    if ('errors' in response) {
      console.log('Auth error:', response.errors);
      return response.errors;
    }

    if ('token' in response) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        `devs:session-token=${response.token}`,
        'HttpOnly',
        'Path=/',
        `Max-Age=${signInInput.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600}`,
        isProduction ? 'SameSite=None; Secure' : 'SameSite=Lax',
      ].join('; ');

      ctx.res.setHeader('Set-Cookie', cookieOptions);
    }

    return response;
  }

  @Mutation(() => SignOutResponse)
  async signOut(@Context() ctx: GraphQLContext) {
    const response = await this.userService.signOut(ctx);

    if (response.success) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        'devs:session-token=',
        'HttpOnly',
        'Path=/',
        'Max-Age=0',
        isProduction ? 'SameSite=None; Secure' : 'SameSite=Lax',
      ].join('; ');

      ctx.res.setHeader('Set-Cookie', cookieOptions);
    }

    return response;
  }

  @Mutation(() => GitHubUserResponse)
  async gitHub(@Context() ctx: GraphQLContext) {
    const response = await this.userService.gitHub(ctx);

    console.log('cookies before redirect:', ctx.req.headers.cookie);

    return response;
  }

  @SingleItem('Session retrieved successfully')
  @Query(() => SessionSingleResponse)
  async getSession(@Context() ctx: GraphQLContext) {
    const response = await this.userService.getSession(ctx);
    return response;
  }
}
