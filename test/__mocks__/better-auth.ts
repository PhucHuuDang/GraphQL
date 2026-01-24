// Mock for better-auth to avoid ES module issues in Jest
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const betterAuth = jest.fn().mockImplementation(() => ({
  api: {},
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

export type BetterAuthOptions = Record<string, unknown>;
export type BetterAuthPlugin = {
  id: string;
  init?: (ctx: unknown) => unknown;
};
export type User = {
  id: string;
  email?: string;
  name?: string;
};
export type Auth = ReturnType<typeof betterAuth>;
