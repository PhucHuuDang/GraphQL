import { INestApplication, ValidationPipe } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { GraphQLExceptionFilter } from '../src/common/filters/graphql-exception.filter';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

// GraphQL test client
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

// ⭐ Tạo một shared PrismaService instance cho toàn bộ test suite
let sharedPrismaInstance: PrismaService | null = null;

function getSharedPrismaInstance(): PrismaService {
  if (!sharedPrismaInstance) {
    sharedPrismaInstance = new PrismaService();
  }
  return sharedPrismaInstance;
}

// Test database helpers
export class TestDatabase {
  private prisma: PrismaService;

  constructor() {
    // ⭐ Sử dụng shared instance
    this.prisma = getSharedPrismaInstance();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (error) {
      // Ignore if already connected
      console.log('Prisma already connected or connection error:', error);
    }
  }

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
    // It will be disconnected after all tests complete
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }
}

// Test data factory
export class TestDataFactory {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

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

// Test app factory
export async function createTestApp(): Promise<{
  app: INestApplication;
  testClient: GraphQLTestClient;
  testDb: TestDatabase;
  dataFactory: TestDataFactory;
}> {
  const testDb = new TestDatabase();
  await testDb.connect();

  const prismaInstance = getSharedPrismaInstance();

  console.log('=== DEBUG INFO ===');
  console.log('PrismaInstance has user?', 'user' in prismaInstance);
  console.log('PrismaInstance type:', prismaInstance.constructor.name);
  console.log('PrismaInstance user type:', typeof prismaInstance.user);

  try {
    // ⭐ Import AppModule dynamically để đảm bảo không có circular dependency
    const { AppModule } = await import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaInstance)
      .compile();

    // Debug: Check injected prisma
    const injectedPrisma = moduleFixture.get<PrismaService>(PrismaService);
    console.log('Injected PrismaService has user?', 'user' in injectedPrisma);
    console.log('Injected type:', injectedPrisma.constructor.name);
    console.log('Are they same instance?', injectedPrisma === prismaInstance);

    const app = moduleFixture.createNestApplication();

    // Apply same global configuration as main.ts
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

    await app.init();

    const testClient = new GraphQLTestClient(app);
    const dataFactory = new TestDataFactory(prismaInstance);

    return {
      app,
      testClient,
      testDb,
      dataFactory,
    };
  } catch (error) {
    console.error('Error creating test app:', error);
    await testDb.disconnect();
    throw error;
  }
}

// Cleanup helper with null safety
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

// ⭐ Call this after all tests are done
export async function disconnectSharedPrisma(): Promise<void> {
  if (sharedPrismaInstance) {
    await sharedPrismaInstance.$disconnect();
    sharedPrismaInstance = null;
  }
}
