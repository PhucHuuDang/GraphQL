import { betterAuth, BetterAuthPlugin } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import bcrypt from 'bcrypt';
// import { PrismaClient } from 'generated/prisma';
import prisma from './prisma';

export function skipStateMismatch(): BetterAuthPlugin {
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

  advanced: {
    cookiePrefix: 'devs',
    // ⚠️ CRITICAL: Must be false for localhost OAuth to work
    cookieSecure: process.env.NODE_ENV === 'production',
    // Use lax for OAuth on localhost
    cookieSameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },

  // advanced: {
  //   defaultCookieAttributes: {
  //     sameSite: 'None', // this enables cross-site cookies
  //     secure: true, // required for SameSite=None
  //   },
  //   // defaultRedirect: 'http://localhost:3000/blogs',
  // },

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

  session: {
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    },
    cookieCache: {
      enabled: true,
      // maxAge: 5 * 60,
      maxAge: 1 * 60,
    },
  },

  // ⚠️ CRITICAL: trustedOrigins is required for OAuth state validation
  // trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],

  plugins: [skipStateMismatch()],
});
