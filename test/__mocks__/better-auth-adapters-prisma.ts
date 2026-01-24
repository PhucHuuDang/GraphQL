// Mock for better-auth/adapters/prisma
export const prismaAdapter = jest.fn().mockImplementation(() => ({
  id: 'prisma',
  adapter: {},
}));
