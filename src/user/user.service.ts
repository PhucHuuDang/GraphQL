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

@Injectable()
export class UserService {
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
  async signUpEmail(
    email: string,
    password: string,
    name?: string,
    image?: string,
    callbackURL?: string,
    rememberMe?: boolean,
  ): Promise<{
    token: string | null;
    user: User | null;
  }> {
    const body = {
      name: name || '',
      email,
      password,
      image: image || '',
      callbackURL: callbackURL || 'localhost:3000/blogs',
      rememberMe: rememberMe || false,
    };

    console.log({ body });

    const response = await this.authService.api.signUpEmail({
      body,
    });

    console.log({ response });

    const user = await this.userRepository.create({
      data: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        image: response.user.image,
      },
    });

    console.log({ userResponseDb: user });

    console.log(response.user);

    return {
      token: response.token,
      user: response.user,
    };
  }

  async signInEmail(
    email: string,
    password: string,
    rememberMe?: boolean,
    callbackURL?: string,
  ) {
    const { token, redirect, url, user } =
      await this.authService.api.signInEmail({
        body: {
          email,
          password,
          callbackURL,
          rememberMe,
        },
      });

    if (!token) {
      return {
        error: 'Invalid credentials',
        statusCode: 401,
      };
    }

    return {
      token,
      redirect,
      url,
      user,
    };
  }

  async signOut(req: Request) {
    const response = await this.authService.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
    return response;
  }

  // async signIn(
  //   email: string,
  //   password: string,
  // ): Promise<{ session: UserSession }> {
  //   const session = await this.authService.api.signInEmail({});

  //   return {
  //     session,
  //   };
  // }
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
