/**
 * Global Teardown for E2E Tests
 * This file runs ONCE after ALL test files complete
 */
import { PrismaClient } from '../generated/prisma';
import { disconnectPrismaForAuth } from '../src/core/auth/prisma';

export default async function globalTeardown() {
  console.log('\n🧹 Global test teardown starting...');

  try {
    // Disconnect Better Auth's Prisma instance
    await disconnectPrismaForAuth();
    console.log('✅ Better Auth Prisma disconnected');
  } catch (error) {
    console.error('Error disconnecting Better Auth Prisma:', error);
  }

  // Clean up any remaining connections
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Optional: Clean database after tests (uncomment if needed)
    // await cleanDatabase(prisma);
    await prisma.$disconnect();
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('Error during teardown:', error);
  }

  console.log('✅ Global test teardown complete\n');
}
