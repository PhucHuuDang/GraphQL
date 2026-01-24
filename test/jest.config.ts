export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!better-auth)'],
  testTimeout: 30000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^better-auth$': '<rootDir>/__mocks__/better-auth.ts',
    '^../../lib/auth\\.js$': '<rootDir>/../src/lib/auth.ts',
    '^(.+)\\.js$': '$1',
  },
};
