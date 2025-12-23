// import { betterAuth, BetterAuthPlugin } from 'better-auth';

import { prismaAdapter } from 'better-auth/adapters/prisma';
import bcrypt from 'bcrypt';
// import { PrismaClient } from 'generated/prisma';
import prisma from './prisma';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { betterAuth, BetterAuthPlugin } = require('better-auth');

export function skipStateMismatch(): typeof BetterAuthPlugin {
  return {
    id: 'skip-state-mismatch',
    init(ctx) {
      return {
        context: {
          ...ctx,
          oauthConfig: {
            skipStateCookieCheck: true,
            ...ctx?.oauthConfig,
          },
        },
      };
    },
  };
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    debugLogs: true,
  }),

  experimental: {
    joins: true,
  },

  baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
  basePath: '/api/auth', // ✅ BẮT BUỘC

  emailAndPassword: {
    enabled: true,
    signInRedirect: '/blogs',
    signUpRedirect: '/sign-up-success',
    signOutRedirect: '/sign-out',

    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async (data) => {
        return await bcrypt.compare(data.password, data.hash);
      },
    },
    // requireEmailVerification: true,
    // sendVerificationEmail: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,

      redirectURI: 'http://localhost:3001/api/auth/callback/github',
      // Set to false to allow automatic user creation on first GitHub sign-in
      disableImplicitSignUp: false,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        input: false,
        defaultValue: 'user',
      },
    },
  },

  // session: {
  //   cookie: {
  //     httpOnly: true,
  //     sameSite: 'lax',
  //     secure: false,
  //     path: '/',
  //   },
  //   cookieCache: {
  //     enabled: true,
  //     // maxAge: 5 * 60,
  //     maxAge: 1 * 60,
  //   },
  // },

  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: 'lax',
          secure: true,
        },
      },
    },
  },

  // ⚠️ CRITICAL: trustedOrigins is required for OAuth state validation
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],

  plugins: [skipStateMismatch()],
});
