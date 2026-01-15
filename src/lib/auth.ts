import {
  betterAuth,
  BetterAuthPlugin,
  type BetterAuthOptions,
} from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import bcrypt from 'bcrypt';
import { prismaForAuth } from './prisma';

/**
 * Plugin to skip OAuth state mismatch errors
 * Useful for development and testing
 */
function createSkipStateMismatchPlugin(): BetterAuthPlugin {
  return {
    id: 'skip-state-mismatch',
    init(ctx) {
      return {
        context: {
          ...ctx,
          oauthConfig: {
            skipStateMismatch: true,
            ...ctx?.oauthConfig,
          },
        },
      };
    },
  };
}

/**
 * Authentication configuration interface
 */
interface AuthConfig {
  backendUrl?: string;
  frontendUrl?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  nodeEnv?: string;
}

/**
 * Default user role for new signups
 */
const DEFAULT_USER_ROLE = 'USER';

/**
 * Password hash rounds for bcrypt
 */
const BCRYPT_ROUNDS = 10;

/**
 * Creates Better Auth configuration
 */
function createAuthConfig(config: AuthConfig = {}): BetterAuthOptions {
  const {
    backendUrl = process.env.BACKEND_URL || 'http://localhost:3001',
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000',
    githubClientId = process.env.GITHUB_CLIENT_ID,
    githubClientSecret = process.env.GITHUB_CLIENT_SECRET,
    nodeEnv = process.env.NODE_ENV,
  } = config;

  const isProduction = nodeEnv === 'production';

  return {
    database: prismaAdapter(prismaForAuth, {
      provider: 'postgresql',
      debugLogs: !isProduction,
    }),

    appName: 'Devs',

    // User hooks for custom logic
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: DEFAULT_USER_ROLE,
          required: false,
        },
      },
    },

    experimental: {
      joins: true,
    },

    baseURL: backendUrl,
    basePath: '/api/auth',

    // Email and password authentication
    emailAndPassword: {
      enabled: true,
      password: {
        hash: async (password: string) => {
          return await bcrypt.hash(password, BCRYPT_ROUNDS);
        },
        verify: async (data: { password: string; hash: string }) => {
          return await bcrypt.compare(data.password, data.hash);
        },
      },
    },

    // Social authentication providers
    socialProviders: {
      github: {
        clientId: githubClientId,
        clientSecret: githubClientSecret,
        redirectURI: `${backendUrl}/api/auth/callback/github`,
        disableImplicitSignUp: false,
      },
    },

    // Advanced cookie configuration
    advanced: {
      cookies: {
        state: {
          attributes: {
            sameSite: 'lax',
            secure: isProduction,
          },
        },
      },
    },

    trustedOrigins: [frontendUrl],

    plugins: [createSkipStateMismatchPlugin()],
  };
}

/**
 * Better Auth instance
 * This is initialized once and reused across the application
 */
export const auth = betterAuth(createAuthConfig());

/**
 * Export configuration creator for testing purposes
 */
export { createAuthConfig };
