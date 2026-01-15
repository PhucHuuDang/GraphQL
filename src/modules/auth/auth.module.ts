import { Global, Module, Logger } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';
import type { Auth } from 'better-auth';

/**
 * Authentication Module
 * Provides Better Auth integration throughout the application
 *
 * This module is marked as @Global() so BetterAuthService is available
 * in all modules without needing to import AuthModule explicitly.
 *
 * @see BetterAuthService
 */
@Global()
@Module({
  providers: [
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
    BetterAuthService,
  ],
  exports: [AUTH_INSTANCE_KEY, BetterAuthService],
})
export class AuthModule {}
