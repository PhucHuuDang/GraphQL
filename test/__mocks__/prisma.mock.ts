/**
 * Mock PrismaService for unit tests
 * Provides typed mock functions for Prisma model methods
 */
import { Mock, vi } from 'vitest';

export interface MockPrismaPost {
  findUnique: Mock;
  findFirst: Mock;
  findMany: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
}

export interface MockPrismaUser {
  findUnique: Mock;
  findFirst: Mock;
}

export interface MockPrismaSession {
  findUnique: Mock;
  create: Mock;
}

export interface MockPrismaService {
  post: MockPrismaPost;
  user: MockPrismaUser;
  session: MockPrismaSession;
  $transaction: Mock;
}

/**
 * Create a fresh PrismaService mock
 * Each test should call this to get isolated mock instances
 */
export const createPrismaMock = (): MockPrismaService => ({
  post: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((operations) => {
    if (Array.isArray(operations)) {
      return Promise.all(operations);
    }
    return operations({ post: {}, user: {}, session: {} });
  }),
});

/**
 * Reset all mocks on a PrismaService mock instance
 */
export const resetPrismaMock = (mock: MockPrismaService): void => {
  Object.values(mock.post).forEach((fn) => fn.mockReset());
  Object.values(mock.user).forEach((fn) => fn.mockReset());
  Object.values(mock.session).forEach((fn) => fn.mockReset());
  mock.$transaction.mockReset();
};
