import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from '../../models/user.model';
import { CreateUser } from './dto/create-user';

import { AccountModel } from '../../models/account.model';

// import { User } from 'better-auth';

import {
  GetProfileResponse,
  GetSessionResponse,
  GitHubUserResponse,
  SignInEmailUser,
  SignOutResponse,
  SignUpEmailUser,
} from './auth.model';
import { SignInInput, SignUpInput, UpdateProfileArgs } from './dto/user.dto';
import type { GraphQLContext } from '../../interface/graphql.context';
import { ChangePasswordInput } from '../authors/author.dto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { User } = require('better-auth');
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

  @Mutation(() => UserModel)
  async updateProfile(
    @Args() args: UpdateProfileArgs,
    @Context() context: GraphQLContext,
  ) {
    const response = await this.userService.updateProfile(args, context);
    return response;
  }

  @Mutation((type) => SignUpEmailUser)
  async signUpEmail(
    @Args('signUpInput') signUpInput: SignUpInput,
    @Context() ctx: GraphQLContext,
  ) {
    const { email, password, name, image, callbackURL, rememberMe } =
      signUpInput;

    console.log({ signUpInput });

    const response = await this.userService.signUpEmail(signUpInput);

    // console.log({ response });

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
      ctx.res.setHeader(
        'Set-Cookie',
        `devs.session_token=${response.token}; HttpOnly; Path=/; Max-Age=${
          signInInput.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600
        }; SameSite=Lax`,
      );
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
