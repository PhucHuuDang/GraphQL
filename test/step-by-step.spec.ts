/**
 * Test to find the exact moment the hang occurs
 */
import { Test, TestingModule } from '@nestjs/testing';

import { afterEach, describe, expect, it } from 'vitest';

describe('PostsService Investigation', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      try {
        await module.close();
      } catch (e) {}
    }
  });

  it('Step 1: Import PostsService', async () => {
    console.log('Step 1: Importing PostsService...');
    const start = Date.now();
    const { PostsService } = await import('../src/modules/post/post.service');
    console.log(`✅ PostsService imported in ${Date.now() - start}ms`);
    expect(PostsService).toBeDefined();
  }, 5000);

  it('Step 2: Import all dependencies', async () => {
    console.log('Step 2: Importing dependencies...');
    const start = Date.now();
    const { PostsService } = await import('../src/modules/post/post.service');
    const { PrismaService } = await import('../src/core/database/prisma.service');
    const { UPSTASH_REDIS } = await import('../src/core/constants/injection-tokens');
    console.log(`✅ All dependencies imported in ${Date.now() - start}ms`);
    expect(PostsService).toBeDefined();
    expect(PrismaService).toBeDefined();
    expect(UPSTASH_REDIS).toBeDefined();
  }, 5000);

  it('Step 3: Create TestingModule WITHOUT compile', async () => {
    console.log('Step 3: Creating TestingModule without compile...');
    const { PostsService } = await import('../src/modules/post/post.service');
    const { PrismaService } = await import('../src/core/database/prisma.service');
    const { UPSTASH_REDIS } = await import('../src/core/constants/injection-tokens');

    const start = Date.now();
    const builder = Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            $connect: async () => {},
            post: { findUnique: async () => null },
          },
        },
        {
          provide: UPSTASH_REDIS,
          useValue: { get: async () => null },
        },
      ],
    });
    console.log(`✅ TestingModule created (not compiled) in ${Date.now() - start}ms`);
    expect(builder).toBeDefined();
  }, 5000);

  it('Step 4: Compile the TestingModule', async () => {
    console.log('Step 4: Compiling TestingModule...');
    const { PostsService } = await import('../src/modules/post/post.service');
    const { PrismaService } = await import('../src/core/database/prisma.service');
    const { UPSTASH_REDIS } = await import('../src/core/constants/injection-tokens');

    const builder = Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            $connect: async () => {},
            $disconnect: async () => {},
            post: {
              findUnique: async () => null,
              findMany: async () => [],
              findFirst: async () => null,
              count: async () => 0,
            },
          },
        },
        {
          provide: UPSTASH_REDIS,
          useValue: {
            get: async () => null,
            set: async () => 'OK',
          },
        },
      ],
    });

    console.log('Calling compile()...');
    const start = Date.now();
    module = await builder.compile();
    console.log(`✅ TestingModule compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 15000);
});
