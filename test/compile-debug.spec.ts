/**
 * Debug test to isolate compile() hang issue
 */
import { Test, TestingModule } from '@nestjs/testing';

import { afterEach, describe, expect, it } from 'vitest';

import { AUTH_INSTANCE_KEY } from '../src/constants/auth.constants';
import { UPSTASH_REDIS } from '../src/lib/key';
import { AuthGuard } from '../src/modules/auth/auth.guard';
// Import PostModule components directly
import { PostResolver } from '../src/modules/post/post.resolver';
import { PostsService } from '../src/modules/post/post.service';
import { PrismaService } from '../src/prisma/prisma.service';

// Create a mock Redis client
function createMockRedis() {
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    expire: async () => 1,
    incr: async () => 1,
    keys: async () => [],
    flushall: async () => 'OK',
  };
}

// Create a mock Prisma service
function createMockPrisma() {
  return {
    $connect: async () => {},
    $disconnect: async () => {},
    post: {
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
      count: async () => 0,
    },
  };
}

// Create a mock AuthGuard that always allows access
const mockAuthGuard = {
  canActivate: () => true,
};

describe('Compile Debug', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      try {
        await module.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  });

  it('should compile PostsService directly with mocks', async () => {
    console.log('Testing PostsService compilation with direct mocks...');
    const start = Date.now();

    module = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: createMockPrisma(),
        },
        {
          provide: UPSTASH_REDIS,
          useValue: createMockRedis(),
        },
      ],
    }).compile();

    console.log(`✅ PostsService compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();

    const postsService = module.get(PostsService);
    expect(postsService).toBeDefined();
  }, 10000);

  it('should compile PostResolver directly with mocks and AuthGuard override', async () => {
    console.log('Testing PostResolver compilation with direct mocks and AuthGuard override...');
    const start = Date.now();

    // PostResolver depends on PostsService and uses @UseGuards(AuthGuard)
    module = await Test.createTestingModule({
      providers: [
        PostResolver,
        PostsService,
        {
          provide: PrismaService,
          useValue: createMockPrisma(),
        },
        {
          provide: UPSTASH_REDIS,
          useValue: createMockRedis(),
        },
        // Add AUTH_INSTANCE_KEY for dependencies
        {
          provide: AUTH_INSTANCE_KEY,
          useValue: {
            api: {
              getSession: async () => null,
            },
          },
        },
      ],
    })
      // Override AuthGuard to bypass authentication
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    console.log(`✅ PostResolver compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();

    const postResolver = module.get(PostResolver);
    expect(postResolver).toBeDefined();
  }, 10000);
});
