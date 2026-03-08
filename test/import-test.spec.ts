/**
 * Test to isolate the PostFiltersInput import issue
 */
import { Inject, Injectable } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { Redis } from '@upstash/redis';

import { afterEach, describe, expect, it } from 'vitest';

import { Post, Prisma } from '../generated/prisma';
// Import BaseRepository
// Import BaseRepository
import { BaseRepository, PrismaService, UPSTASH_REDIS } from '../src/core';

// **REMOVED**: import { PostFiltersInput } from '../src/modules/post/dto/post-filters.dto';

// Create a clean version of PostsService
@Injectable()
class CleanPostsService extends BaseRepository<Post, Prisma.PostDelegate> {
  constructor(
    prisma: PrismaService,
    @Inject(UPSTASH_REDIS) private readonly upstashRedis: Redis,
  ) {
    super(prisma, 'post', 'CleanPostsService');
  }

  async testMethod() {
    return 'working';
  }
}

describe('PostsService Import Investigation', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      try {
        await module.close();
      } catch (e) {}
    }
  });

  it('should compile CleanPostsService WITHOUT PostFiltersInput import', async () => {
    console.log('Testing CleanPostsService WITHOUT PostFiltersInput import...');

    const mockPrisma = {
      $connect: async () => {},
      $disconnect: async () => {},
      post: {
        findUnique: async () => null,
        findMany: async () => [],
        count: async () => 0,
      },
    };

    const mockRedis = {
      get: async () => null,
      set: async () => 'OK',
    };

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        CleanPostsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: UPSTASH_REDIS,
          useValue: mockRedis,
        },
      ],
    }).compile();

    console.log(`✅ CleanPostsService compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 10000);
});
