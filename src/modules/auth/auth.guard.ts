// import type { CanActivate, ContextType, ExecutionContext } from '@nestjs/common';
import {
  CanActivate,
  type ContextType,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GqlExecutionContext } from '@nestjs/graphql';

// import type { Auth } from 'better-auth';
import { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';

import {
  AUTH_INSTANCE_KEY,
  IS_OPTIONAL_AUTH,
  IS_PUBLIC_AUTH,
} from '../../constants/auth.constants';
import { fromNodeHeaders } from '../../lib/transform-node-headers';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from '../session/session.service';

import { BetterAuthService } from './better-auth.service';

import type { Auth } from 'better-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(AUTH_INSTANCE_KEY)
    private readonly auth: BetterAuthService,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

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

  /**
   * Validates if the current request is authenticated for all REST, GraphQL & Websockets
   * Attaches session and user information to the request object
   * @param context - The execution context of the current request
   * @returns True if the request is authorized to proceed, throws an error otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAuthPublic) return true;

    const contextType: ContextType & 'graphql' = context.getType();

    if (contextType === 'ws') {
      const socket = context.switchToWs().getClient<Socket>();
      try {
        const session = await this.auth.api.getSession({
          headers: fromNodeHeaders(socket?.handshake?.headers),
        });
        socket['session'] = session;
      } catch (_) {
        socket.disconnect();
        return false;
      }
      return true;
    }

    let request: FastifyRequest;

    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      request = gqlCtx.getContext()?.req;
      console.log({ request });
    } else {
      request = context.switchToHttp().getRequest();
    }

    const token = this.getSessionToken(fromNodeHeaders(request?.headers));

    const session = await this.sessionService.findOne(
      {
        token,
      },
      {
        include: {
          user: true,
        },
      },
    );

    // const session = await this.auth.api.getSession({
    //   headers: fromNodeHeaders(request?.headers),
    // });

    console.log({ session });

    request['session'] = session;
    request['user'] = session?.user ?? null; // For Sentry

    console.log(request['session']);

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAuthOptional && !session) return true;

    if (!session) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
      });
    }

    return true;
  }
}
