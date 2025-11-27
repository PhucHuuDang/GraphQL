import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/models/user.model';
import { UpdateUser } from './dto/update-user';
import { CreateUser } from './dto/create-user';
import { auth } from 'src/lib/auth';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { UserRepository } from './user.repository';
import { User } from 'better-auth';
import { SignInInput, SignUpInput } from 'src/dto/user.dto';
import { ChangePasswordInput } from 'src/authors/author.dto';

@Injectable()
export class UserService {
  // ⚠️ This is where the USER is redirected AFTER authentication completes
  // NOT the OAuth callback URL (Better Auth handles that automatically)
  private readonly callbackURL: string = 'http://localhost:3000/blogs';
  constructor(
    private readonly authService: AuthService<typeof auth>,
    private readonly userRepository: UserRepository,
  ) {}

  async getAccounts(req: Request) {
    const accounts = await this.authService.api.listUserAccounts({
      headers: fromNodeHeaders(req.headers),
    });
    return {
      accounts,
    };
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

    try {
      const response = await this.authService.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: this.callbackURL,
          rememberMe,
        },
      });

      return response;
    } catch (err: any) {
      console.error('ERR SIGN IN:', err);

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
    const response = await this.authService.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
    return response;
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

    // return result;
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
