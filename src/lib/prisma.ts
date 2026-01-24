import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '../../generated/prisma';

// ✅ Sửa type để accept extended client
const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
  prismaForAuth: PrismaClient | null;
};

// ✅ Tạo function để tạo extended client
function createPrismaClient() {
  return new PrismaClient().$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// ✅ Lazy-loaded Prisma instance for Better Auth adapter
// This prevents database connection at module import time
let _prismaForAuth: PrismaClient | null = globalForPrisma.prismaForAuth ?? null;

export function getPrismaForAuth(): PrismaClient {
  if (!_prismaForAuth) {
    _prismaForAuth = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prismaForAuth = _prismaForAuth;
    }
  }
  return _prismaForAuth;
}

// For backward compatibility - use Proxy to lazy-load
export const prismaForAuth = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrismaForAuth()[prop as keyof PrismaClient];
  },
});

// Cleanup function for tests
export async function disconnectPrismaForAuth(): Promise<void> {
  if (_prismaForAuth) {
    await _prismaForAuth.$disconnect();
    _prismaForAuth = null;
    globalForPrisma.prismaForAuth = null;
  }
}
