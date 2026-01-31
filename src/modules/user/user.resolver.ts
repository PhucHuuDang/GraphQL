import { Args, Context, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { RawResponse, SingleItem } from '../../common/decorators/response.decorators';
import { SingleResponse } from '../../common/types/response.types';
import { AccountModel } from '../../models/account.model';
import { UserModel } from '../../models/user.model';

import { SignInInput, SignUpInput, UpdateProfileArgs } from './dto/user.dto';
// import { User } from 'better-auth';
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

import type { GraphQLContext } from '../../interface/graphql.context';

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
    // console.log({ test });
    return test;
  }

  @Query(() => SingleProfileResponse)
  async getProfile(@Context() context: GraphQLContext) {
    const response = await this.userService.getProfile(context);
    // console.log({ response });
    return response;
  }

  @Mutation(() => UserModel)
  async updateProfile(@Args() args: UpdateProfileArgs, @Context() context: GraphQLContext) {
    const response = await this.userService.updateProfile(args, context);
    return response;
  }

  @RawResponse()
  // @SingleItem('Sign up successful')
  @Mutation((type) => SignUpEmailUser, { description: 'Sign up email user' })
  async signUpEmail(
    @Args('signUpInput', { type: () => SignUpInput }) signUpInput: SignUpInput,
    @Context() ctx: GraphQLContext,
  ) {
    // console.log({ input: signUpInput });

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
      ctx.res.setHeader(
        'Set-Cookie',
        `devs.session_token=${response.token}; HttpOnly; Path=/; Max-Age=${
          signInInput.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600
        }; SameSite=Lax`,
      );
    }

    return response;
  }

  @Mutation(() => SignOutResponse)
  async signOut(@Context() ctx: GraphQLContext) {
    const response = await this.userService.signOut(ctx);

    if (response.success) {
      ctx.res.setHeader(
        'Set-Cookie',
        'devs.session_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
      );
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
    // console.log(ctx.req);
    const response = await this.userService.getSession(ctx);

    // console.log({ response });
    return response;
  }
}
