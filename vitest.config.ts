import { defineConfig } from 'vitest/config';

// Set environment variables BEFORE vitest loads any test files
// This is critical because auth.ts and upstash-client.ts check NODE_ENV
// at module load time, not at runtime
process.env.NODE_ENV = 'test';
process.env.SKIP_PRISMA_CONNECT = 'true';

export default defineConfig({
  test: {
    environment: 'node',

    // Ensure env is passed to worker processes
    env: {
      NODE_ENV: 'test',
      SKIP_PRISMA_CONNECT: 'true',
    },
    root: './test',
    testTimeout: 60000,
    hookTimeout: 120000, // Increased for beforeAll database operations
    globals: true,
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],

    // Run test files sequentially (one at a time)
    fileParallelism: false,

    // Run tests within a file sequentially
    sequence: {
      concurrent: false,
    },

    // Global setup for database
    globalSetup: './global-setup.ts',

    // Pool configuration - use threads for NestJS compatibility
    pool: 'threads',

    // Reporter configuration
    reporters: ['verbose'],
  },
});
