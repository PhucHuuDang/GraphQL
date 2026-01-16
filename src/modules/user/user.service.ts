import { Injectable } from '@nestjs/common';

import { APIError, type User as UserType } from 'better-auth';

import { Prisma, User } from '../../../generated/prisma';
import { BaseRepository } from '../../common/base.repository';
import { GraphQLContext } from '../../interface/graphql.context';
import { auth } from '../../lib/auth';
import { fromNodeHeaders } from '../../lib/transform-node-headers';
import { UserModel } from '../../models/user.model';
import { BetterAuthService } from '../../modules/auth/better-auth.service';
import { SessionService } from '../../modules/session/session.service';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateUser } from './dto/create-user';
import { SignInInput, SignUpInput, UpdateProfileArgs } from './dto/user.dto';
import { GetProfileResponse, GetSessionResponse } from './auth.model';

@Injectable()
export class UserService extends BaseRepository<User, Prisma.UserDelegate> {
  // ⚠️ This is where the USER is redirected AFTER authentication completes
  // NOT the OAuth callback URL (Better Auth handles that automatically)
  private readonly callbackURL: string = 'http://localhost:3000/blogs';

  private getSessionToken(headers: Headers): string | null {
    const cookie = headers.get('cookie');
    if (!cookie) return null;

    return (
      cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('devs.session_token='))
        ?.split('=')[1] ?? null
    );
  }
  constructor(
    prisma: PrismaService,
    private readonly authService: BetterAuthService,
    private readonly sessionService: SessionService,
  ) {
    super(prisma.user, 'UserService');
  }

  async getAccounts({ req }: GraphQLContext) {
    const accounts = await this.authService.api.listUserAccounts({
      headers: fromNodeHeaders(req.headers),
    });
    return {
      accounts,
    };
  }

  async getAccessToken({ req }: GraphQLContext) {
    const accessToken = await this.authService.api.getAccessToken({
      body: {
        providerId: 'email',
        accountId: '123',
        userId: '123',
      },
      headers: fromNodeHeaders(req.headers),
    });
    return accessToken;
  }
  async signUpEmail(signUpInput: SignUpInput) {
    const { email, password, avatarUrl, name, rememberMe } = signUpInput;

    const body = {
      email,
      password,
      name,
    };

    try {
      const response = await this.authService.api.signUpEmail({
        body,
      });
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        console.log(error.message, error.status);
      }

      throw error;
    }
  }

  async signInEmail(signInInput: SignInInput, { req }: GraphQLContext) {
    const { email, password, callbackURL, rememberMe } = signInInput;

    console.log('signInEmail', { email, password, callbackURL, rememberMe });
    try {
      const response = await this.authService.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: this.callbackURL,
          rememberMe,
        },

        headers: fromNodeHeaders(req.headers),
      });

      console.log({ response });

      return response;
    } catch (err: any) {
      console.log({ err });
      if (err instanceof APIError) {
        console.log(err.message, err.status);
      }

      return {
        error: err?.message ?? 'Invalid credentials',
        statusCode: 401,
      };
    }
  }

  async signOut({ req }: GraphQLContext) {
    console.log(req.headers);

    const headers = fromNodeHeaders(req.headers);
    try {
      return await this.authService.api.signOut({
        headers: fromNodeHeaders(req.headers),
      });
    } catch (err: any) {
      if (err?.body?.code === 'FAILED_TO_GET_SESSION') {
        const token = this.getSessionToken(headers);

        if (!token) return { success: false };

        const test = await this.sessionService.delete({
          where: {
            token,
          },
        });
        console.log({ test });

        return { success: true };
      }
      throw err;
    }
  }

  async updateProfile(updateProfileArgs: UpdateProfileArgs, { req }: GraphQLContext) {
    const { email, name, avatarUrl, password, rememberMe } = updateProfileArgs;

    const headers = fromNodeHeaders(req.headers);

    const response = await this.authService.api.updateUser({
      body: {
        image: avatarUrl,
        name,
      },
      headers,
    });

    return response;
  }

  // async changePassword(
  //   changePasswordInput: ChangePasswordInput,
  //   { req }: GraphQLContext,
  // ) {
  //   const { currentPassword, newPassword } = changePasswordInput;

  //   const response = await this.authService.api.changePassword({
  //     body: {
  //       currentPassword,
  //       newPassword,
  //       revokeOtherSessions: true,
  //     },

  //     headers: fromNodeHeaders(req.headers),
  //   });
  //   return response;
  // }

  async gitHub({ req }: GraphQLContext) {
    try {
      const data = await this.authService.api.signInSocial({
        body: {
          provider: 'github',
          // This is where user goes AFTER successful authentication (frontend page)
          callbackURL: this.callbackURL,
        },
        headers: fromNodeHeaders(req.headers),
      });

      console.log('GitHub sign-in initiation response:', data);

      // The response should contain a redirect URL to GitHub OAuth
      if (!data.url) {
        throw new Error('No redirect URL received from Better Auth');
      }

      return data;
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  async githubCallback({ req }: GraphQLContext) {
    return await this.authService.api.callbackOAuth({
      method: 'GET',
      headers: fromNodeHeaders(req.headers),
      params: { id: 'github' }, // <-- đây thay thế cho provider
      request: req as any,
    });
  }

  async getSession({ req }: GraphQLContext) {
    console.log(
      fromNodeHeaders(req.headers)
        .get('cookie')
        ?.split(';')
        .find((item) => item.includes('devs.session_token')),
    );

    const headers = fromNodeHeaders(req.headers);

    const apiSession = (await this.authService.api.getSession({
      headers,
    })) as GetSessionResponse | null;

    if (apiSession) return apiSession;
    const token = this.getSessionToken(headers);

    if (!token) return null;
    const session = await this.sessionService.findOne({
      token,
    });

    if (!session) return null;

    const user = await this.findById(session?.userId);

    if (!user) return null;

    return {
      session,
      user,
    };
  }

  async getProfile({ req }: GraphQLContext): Promise<GetProfileResponse | null> {
    const response = await this.authService.api.accountInfo({
      headers: fromNodeHeaders(req.headers),
    });

    if (!response) return null;
    console.log({ response });

    return {
      user: {
        id: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email ?? undefined,
        image: response.user.image,
        emailVerified: response.user.emailVerified,
      },
      data: response.data,
    };
  }
  async isExists(email: string, id: number) {}
  async createUser(createUserInput: CreateUser): Promise<
    | UserModel
    | {
        error: string;
        statusCode: number;
      }
  > {
    const test = await Promise.resolve({
      error: 'User already exists',
      statusCode: 400,
    });
    return test;
  }
}
