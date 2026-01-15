import { Injectable, Inject, Logger } from '@nestjs/common';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';
import type { Auth } from 'better-auth';

/**
 * Service wrapper for Better Auth
 * Provides a clean interface to Better Auth functionality
 */
@Injectable()
export class BetterAuthService {
  private readonly logger = new Logger(BetterAuthService.name);

  constructor(@Inject(AUTH_INSTANCE_KEY) private readonly authInstance: Auth) {
    this.logger.log('BetterAuthService initialized');
  }

  /**
   * Get the Better Auth API instance
   * Used for server-side authentication operations
   */
  get api() {
    return this.authInstance.api;
  }

  /**
   * Get the full Better Auth instance
   * Use this for advanced operations
   */
  get instance(): Auth {
    return this.authInstance;
  }

  /**
   * Legacy getter for backwards compatibility
   * @deprecated Use `instance` instead
   */
  get auth(): Auth {
    return this.authInstance;
  }

  /**
   * Verify if a session token is valid
   */
  async verifySession(headers: Headers) {
    try {
      return await this.api.getSession({ headers });
    } catch (error) {
      this.logger.debug('Session verification failed', error);
      return null;
    }
  }

  /**
   * Sign out a user by invalidating their session
   */
  async signOut(headers: Headers) {
    try {
      return await this.api.signOut({ headers });
    } catch (error) {
      this.logger.error('Sign out failed', error);
      throw error;
    }
  }
}
