import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import prisma from '../../src/core/auth/prisma';

// import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'default-secret-for-testing',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3002',
  basePath: '/api/auth',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKEND_URL || 'http://localhost:3002',
  ],
});
