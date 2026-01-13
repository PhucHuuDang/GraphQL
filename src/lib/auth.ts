// src/lib/auth.ts
import { betterAuth, BetterAuthPlugin } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import bcrypt from 'bcrypt';
// import prisma from './prisma';

import { prismaForAuth } from './prisma';

export function skipStateMismatch(): BetterAuthPlugin {
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

// ✅ Export auth instance
export const auth = betterAuth({
  database: prismaAdapter(prismaForAuth, {
    provider: 'postgresql',
    debugLogs: true,
  }),

  experimental: {
    joins: true,
  },

  baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
  basePath: '/api/auth',

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
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectURI: 'http://localhost:3001/api/auth/callback/github',
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

  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production', // ✅ Chỉ secure khi production
        },
      },
    },
  },

  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],

  plugins: [skipStateMismatch()],
});
