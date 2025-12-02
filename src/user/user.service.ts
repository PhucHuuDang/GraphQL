import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UpdateUser } from './dto/update-user';
import { CreateUser } from './dto/create-user';
import { auth } from '../lib/auth';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { UserRepository } from './user.repository';
import { APIError, User } from 'better-auth';
import { SignInInput, SignUpInput } from '../dto/user.dto';
import { ChangePasswordInput } from '../authors/author.dto';
import { GetSessionResponse } from '../models/auth.model';
import { SessionRepository } from '../session/session.repository';

@Injectable()
export class UserService {
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
    private readonly authService: AuthService<typeof auth>,
    private readonly userRepository: UserRepository,

    private readonly sessionRepository: SessionRepository,
  ) {}

  async getAccounts(req: Request) {
    const accounts = await this.authService.api.listUserAccounts({
      headers: fromNodeHeaders(req.headers),
    });
    return {
      accounts,
    };
  }

  async getAccessToken(req: Request) {
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
  async signUpEmail(signUpInput: SignUpInput): Promise<{
    token: string | null;
    user: User | null;
  }> {
    const { email, password, callbackURL, image, name, rememberMe } =
      signUpInput;

    const body = {
      email,
      password,
      name: name || '',
      image: image || '',
      callbackURL: callbackURL || this.callbackURL,
      rememberMe: rememberMe || false,
    };

    console.log({ body });

    const response = await this.authService.api.signUpEmail({
      body,
    });
    console.log({ response });

    console.log(response.user);

    return response;
  }

  async signInEmail(signInInput: SignInInput, req: Request) {
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

      return response;
    } catch (err: any) {
      if (err instanceof APIError) {
        console.log(err.message, err.status);
      }

      return {
        error: err?.message ?? 'Invalid credentials',
        statusCode: 401,
      };
    }
  }

  async changePassword(changePasswordInput: ChangePasswordInput, req: Request) {
    const { currentPassword, newPassword, revokeOtherSessions } =
      changePasswordInput;

    const response = await this.authService.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },

      headers: fromNodeHeaders(req.headers),
    });
    return response;
  }

  async signOut(req: Request) {
    console.log(req.headers);

    const headers = fromNodeHeaders(req.headers);
    try {
      return await this.authService.api.signOut({
        headers: fromNodeHeaders(req.headers),
      });
    } catch (err: any) {
      if (err?.body?.code === 'FAILED_TO_GET_SESSION') {
        // ✅ Không có session cũng coi là sign out thành công

        const token = this.getSessionToken(headers);

        if (!token) return { success: false };

        const test = await this.sessionRepository.delete({
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

  async gitHub(req: Request) {
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

  async githubCallback(req: any) {
    return await this.authService.api.callbackOAuth({
      method: 'GET',
      headers: fromNodeHeaders(req.headers),
      params: { id: 'github' }, // <-- đây thay thế cho provider
      request: req,
    });
  }

  async getSession(req: Request) {
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
    const session = await this.sessionRepository.findOne({
      token,
    });

    if (!session) return null;

    const user = await this.userRepository.findById(session?.userId);

    if (!user) return null;

    return {
      session,
      user,
    };
  }
  async isExists(email: string, id: number) {}
  async create(createUserInput: CreateUser): Promise<
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
