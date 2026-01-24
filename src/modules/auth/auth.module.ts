import { Global, Logger, Module } from '@nestjs/common';

import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';
import { SessionService } from '../session/session.service';

import { BetterAuthService } from './better-auth.service';

import type { Auth } from 'better-auth';

/**
 * Creates a mock Better Auth instance for testing
 * This prevents the actual auth library from initializing and connecting to databases
 */
function createMockAuth(): Partial<Auth> {
  return {
    api: {
      signUpEmail: () => Promise.resolve({ user: null, session: null }),
      signInEmail: () => Promise.resolve({ user: null, session: null }),
      signOut: () => Promise.resolve({ success: true }),
      getSession: () => Promise.resolve(null),
    } as unknown as Auth['api'],
    options: {
      appName: 'Test App',
    } as Auth['options'],
  };
}

/**
 * Authentication Module
 * Provides Better Auth integration throughout the application
 *
 * This module is marked as @Global() so BetterAuthService is available
 * in all modules without needing to import AuthModule explicitly.
 *
 * In test mode (NODE_ENV=test), a mock auth instance is provided to prevent
 * database connections from the Better Auth Prisma adapter.
 *
 * @see BetterAuthService
 */
@Global()
@Module({
  providers: [
    // Use synchronous provider in test mode to avoid async deadlocks with Vitest
    ...(process.env.NODE_ENV === 'test'
      ? [
          {
            provide: AUTH_INSTANCE_KEY,
            useValue: createMockAuth(),
          },
        ]
      : [
          {
            provide: AUTH_INSTANCE_KEY,
            useFactory: async (): Promise<Auth> => {
              const logger = new Logger('AuthModule');
              try {
                logger.log('Initializing Better Auth instance...');
                const { auth } = await import('../../lib/auth.js');
                logger.log('Better Auth instance initialized successfully');
                return auth;
              } catch (error) {
                logger.error('Failed to initialize Better Auth', error);
                throw error;
              }
            },
          },
        ]),
    BetterAuthService,
    SessionService,
  ],
  exports: [AUTH_INSTANCE_KEY, BetterAuthService, SessionService],
})
export class AuthModule {}
