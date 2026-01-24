/**
 * Global Setup for E2E Tests
 * This file runs ONCE before ALL test files
 */
import { PrismaClient } from '../generated/prisma';

export default async function globalSetup() {
  console.log('\n🚀 Global test setup starting...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.SKIP_PRISMA_CONNECT = 'true';

  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connection verified');

    // Clean database before all tests
    await cleanDatabase(prisma);
    console.log('✅ Database cleaned');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Global test setup complete\n');
}

async function cleanDatabase(prisma: PrismaClient) {
  // Delete in order to respect foreign key constraints
  await prisma.vote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.moderationAction.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.verification.deleteMany({});
}
