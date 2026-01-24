import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    root: './test',
    testTimeout: 60000,
    hookTimeout: 60000,
    globals: true,
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
    // Run test files sequentially (one at a time)
    fileParallelism: false,
    // Run tests within a file sequentially
    sequence: {
      concurrent: false,
    },
  },
});
