/**
 * E2E Test Setup
 * Production-grade test infrastructure for NestJS + GraphQL + Prisma
 */
import { join } from 'path';

import { INestApplication, ValidationPipe } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';

import GraphQLJSON from 'graphql-type-json';

import request from 'supertest';

import { GraphQLExceptionFilter } from '../src/common/filters/graphql-exception.filter';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';
import { CacheModule } from '../src/core/cache/cache.module';
import { AUTH_INSTANCE_KEY } from '../src/core/constants/auth.constants';
import { UPSTASH_REDIS } from '../src/core/constants/injection-tokens';
import { PrismaModule } from '../src/core/database/prisma.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { BetterAuthService } from '../src/modules/auth/better-auth.service';
import { CategoryModule } from '../src/modules/category/category.module';
import { PostModule } from '../src/modules/post/post.module';
import { SessionModule } from '../src/modules/session/session.module';
import { UserModule } from '../src/modules/user/user.module';

// Set environment variables BEFORE NestJS initialization
process.env.NODE_ENV = 'test';
process.env.SKIP_PRISMA_CONNECT = 'true';

// ============================================================================
// GraphQL Test Client
// ============================================================================

export class GraphQLTestClient {
  constructor(private app: INestApplication) {}

  async query(
    query: string,
    variables?: Record<string, unknown>,
    authToken?: string,
  ): Promise<request.Response> {
    const req = request(this.app.getHttpServer()).post('/graphql').send({ query, variables });

    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
      req.set('Cookie', `devs.session_token=${authToken}`);
    }

    return req;
  }

  async mutate(
    mutation: string,
    variables?: Record<string, unknown>,
    authToken?: string,
  ): Promise<request.Response> {
    return this.query(mutation, variables, authToken);
  }
}

// ============================================================================
// Shared Prisma Instance (Singleton)
// ============================================================================

let sharedPrismaInstance: PrismaService | null = null;
let isConnected = false;

async function getSharedPrismaInstance(): Promise<PrismaService> {
  if (!sharedPrismaInstance) {
    sharedPrismaInstance = new PrismaService();
  }

  if (!isConnected) {
    await sharedPrismaInstance.$connect();
    isConnected = true;
    console.log('✅ Shared Prisma instance connected');
  }

  return sharedPrismaInstance;
}

// ============================================================================
// Test Database Helper
// ============================================================================

export class TestDatabase {
  constructor(private prisma: PrismaService) {}

  async cleanDatabase(): Promise<void> {
    try {
      // Clean tables in order to respect foreign key constraints
      await this.prisma.vote.deleteMany({});
      await this.prisma.comment.deleteMany({});
      await this.prisma.moderationAction.deleteMany({});
      await this.prisma.post.deleteMany({});
      await this.prisma.category.deleteMany({});
      await this.prisma.session.deleteMany({});
      await this.prisma.account.deleteMany({});
      await this.prisma.user.deleteMany({});
      await this.prisma.verification.deleteMany({});
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Don't disconnect shared instance in individual tests
    // It will be disconnected in global teardown
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }
}

// ============================================================================
// Test Data Factory
// ============================================================================

export class TestDataFactory {
  constructor(private prisma: PrismaService) {}

  async createUser(data?: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'USER' | 'ADMIN' | 'MODERATOR';
  }) {
    const timestamp = Date.now();
    return this.prisma.user.create({
      data: {
        name: data?.name || `Test User ${timestamp}`,
        email: data?.email || `test${timestamp}@example.com`,
        password: data?.password || 'hashedPassword123',
        role: data?.role || 'USER',
        emailVerified: true,
      },
    });
  }

  async createCategory(data?: { name?: string; description?: string }) {
    const timestamp = Date.now();
    const name = data?.name || `Test Category ${timestamp}`;
    return this.prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: data?.description || 'Test category description',
      },
    });
  }

  async createPost(data: {
    authorId: string;
    categoryId?: string;
    title?: string;
    content?: Record<string, unknown>;
    isPublished?: boolean;
    tags?: string[];
  }) {
    const timestamp = Date.now();
    const title = data.title || `Test Post ${timestamp}`;
    return this.prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        content: (data.content || { blocks: [] }) as object,
        authorId: data.authorId,
        categoryId: data.categoryId,
        isPublished: data.isPublished ?? true,
        tags: data.tags || [],
        status: data.isPublished ? 'PUBLISHED' : 'DRAFT',
      },
    });
  }

  async createSession(data: { userId: string; token: string }) {
    return this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      },
    });
  }
}

// ============================================================================
// Mock Providers
// ============================================================================

/**
 * Mock Upstash Redis for testing
 * This prevents actual Redis connections during tests
 */
function createMockRedis() {
  const store = new Map<string, string>();

  return {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string) => {
      store.set(key, value);
      return 'OK';
    },
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
    expire: async () => 1,
    incr: async (key: string) => {
      const val = parseInt(store.get(key) || '0', 10) + 1;
      store.set(key, val.toString());
      return val;
    },
    keys: async () => Array.from(store.keys()),
    flushall: async () => {
      store.clear();
      return 'OK';
    },
  };
}

/**
 * Mock Better Auth for testing
 * This prevents the Better Auth prismaAdapter from creating database connections
 */
function createMockBetterAuth() {
  return {
    api: {
      signUpEmail: () => Promise.resolve({ user: null, session: null }),
      signInEmail: () => Promise.resolve({ user: null, session: null }),
      signOut: () => Promise.resolve({ success: true }),
      getSession: () => Promise.resolve(null),
    },
    options: {
      appName: 'Test App',
    },
  };
}

/**
 * Mock BetterAuthService for testing
 */
function createMockBetterAuthService() {
  const mockAuth = createMockBetterAuth();
  return {
    api: mockAuth.api,
    instance: mockAuth,
    auth: mockAuth,
    verifySession: () => Promise.resolve(null),
    signOut: () => Promise.resolve({ success: true }),
  };
}

// ============================================================================
// Test App Factory
// ============================================================================

export async function createTestApp(): Promise<{
  app: INestApplication;
  testClient: GraphQLTestClient;
  testDb: TestDatabase;
  dataFactory: TestDataFactory;
}> {
  console.log('\n📦 Creating test app...');

  // Step 1: Get shared Prisma instance
  console.log('  Step 1: Getting Prisma instance...');
  const prismaInstance = await getSharedPrismaInstance();
  console.log('  Step 1: ✅ Done');

  // Step 2: Import AppModule (AuthModule will use mock auth in test mode)
  console.log('  Step 2: Importing AppModule...');
  const { AppModule } = await import('../src/app.module');
  console.log('  Step 2: ✅ Done');

  // Step 3: Create testing module with overrides
  console.log('  Step 3: Creating test module...');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Override PrismaService with shared instance
    .overrideProvider(PrismaService)
    .useValue(prismaInstance)
    // Mock Upstash Redis to prevent external connections
    .overrideProvider(UPSTASH_REDIS)
    .useValue(createMockRedis())
    .compile();
  console.log('  Step 3: ✅ Done');

  // Step 4: Create NestJS application
  console.log('  Step 4: Creating NestJS app...');
  const app = moduleFixture.createNestApplication();
  console.log('  Step 4: ✅ Done');

  // Step 5: Apply global configuration (same as main.ts)
  console.log('  Step 5: Applying global configuration...');
  app.useGlobalFilters(new GraphQLExceptionFilter(), new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });
  console.log('  Step 5: ✅ Done');

  // Step 6: Initialize the app with timeout protection
  console.log('  Step 6: Initializing app...');
  await Promise.race([
    app.init(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('App init timeout after 30s')), 30000),
    ),
  ]);
  console.log('  Step 6: ✅ Done');

  console.log('✅ Test app created successfully\n');

  const testDb = new TestDatabase(prismaInstance);
  const testClient = new GraphQLTestClient(app);
  const dataFactory = new TestDataFactory(prismaInstance);

  return {
    app,
    testClient,
    testDb,
    dataFactory,
  };
}

// ============================================================================
// Cleanup Helper
// ============================================================================

export async function cleanupTestApp(
  app: INestApplication | undefined,
  testDb: TestDatabase | undefined,
): Promise<void> {
  if (testDb) {
    await testDb.cleanDatabase();
  }

  if (app) {
    await app.close();
  }
}

// ============================================================================
// Global Prisma Disconnect (for global teardown)
// ============================================================================

export async function disconnectSharedPrisma(): Promise<void> {
  if (sharedPrismaInstance && isConnected) {
    await sharedPrismaInstance.$disconnect();
    sharedPrismaInstance = null;
    isConnected = false;
    console.log('✅ Shared Prisma instance disconnected');
  }
}
