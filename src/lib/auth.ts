import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import bcrypt from 'bcrypt';
// import { PrismaClient } from 'generated/prisma';
import prisma from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    debugLogs: true,
  }),

  advanced: {
    cookiePrefix: 'blog',
    cookieSecure: process.env.NODE_ENV === 'production',
  },

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
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [],
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
});
