import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { APIError, type User as UserType } from 'better-auth';

import { Prisma, User } from '../../../generated/prisma';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { GraphQLContext } from '../../common/interfaces/graphql-context.interface';
import { fromNodeHeaders } from '../../core/auth/transform-node-headers';
import { BaseRepository } from '../../core/database/base.repository';
import { PrismaService } from '../../core/database/prisma.service';
import { BetterAuthService } from '../auth/better-auth.service';
import { SessionService } from '../session/session.service';

import { SignInInput, SignUpInput, UpdateProfileArgs } from './dto/user.dto';
import { UserModel } from './models/user.model';
import { GetProfileResponse, GetSessionResponse } from './auth.model';

@Injectable()
export class UserService extends BaseRepository<User, Prisma.UserDelegate> {
  private readonly callbackURL: string;

  private getSessionToken(headers: Headers): string | null {
    const cookie = headers.get('cookie');
    if (!cookie) return null;

    return (
      cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('devs:session-token='))
        ?.split('=')[1] ?? null
    );
  }
  constructor(
    prisma: PrismaService,
    private readonly authService: BetterAuthService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    super(prisma, 'user', 'UserService');
    this.callbackURL =
      this.configService.get<string>('auth.callbackUrl') || 'http://localhost:3000/blogs';
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
  async signUpEmail(signUpInput: SignUpInput, { req }: GraphQLContext) {
    try {
      const response = await this.authService.api.signUpEmail({
        body: {
          name: signUpInput.name,
          email: signUpInput.email,
          password: signUpInput.password,
          rememberMe: signUpInput.rememberMe ?? false,
        },
        headers: fromNodeHeaders(req.headers),
      });

      // If user was created successfully, fetch the complete user data from database
      if (response?.user?.id) {
        const fullUser = await this.findById(response.user.id);

        if (fullUser) {
          return {
            token: response.token,
            user: {
              ...fullUser,
              // Provide default empty arrays for relational fields
              comments: [],
              likes: [],
              sessions: [],
              accounts: [],
            },
          };
        }
      }

      return response;
    } catch (error) {
      if (error instanceof APIError) {
        console.log(error.message, error.status);
      }
      throw error;
    }
  }
  async signInEmail(signInInput: SignInInput, { req }: GraphQLContext) {
    const { email, password, rememberMe } = signInInput;

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

      return response;
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 401) {
          throw new UnauthorizedException(error.message);
        }
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async signOut({ req }: GraphQLContext) {
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

        return { success: true };
      }
      throw err;
    }
  }

  async updateProfile(updateProfileArgs: UpdateProfileArgs, { req }: GraphQLContext) {
    const { email, name, image, password, rememberMe } = updateProfileArgs;

    const headers = fromNodeHeaders(req.headers);

    const response = await this.authService.api.updateUser({
      body: {
        name,
        image,
      },
      headers,
    });

    return response;
  }

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
      params: { id: 'github' },
      request: req as any,
    });
  }

  async getSession({ req }: GraphQLContext) {
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

    if (!session) return ResponseHelper.notFound('Session');

    const user = await this.findById(session?.userId);

    if (!user) return ResponseHelper.notFound('User');

    return ResponseHelper.success({
      session,
      user,
    });
  }

  async getProfile({ req }: GraphQLContext) {
    const response = await this.authService.api.accountInfo({
      headers: fromNodeHeaders(req.headers),
    });

    if (!response) return ResponseHelper.notFound('User');

    return ResponseHelper.success({
      user: {
        id: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email ?? null,
        image: response.user.image,
        emailVerified: response.user.emailVerified,
      },
      data: response.data,
    });
  }
  async isExists(email: string, id: number) {}
}
