/**
 * Systematic test to find what's blocking in PostsService
 */
import { Inject, Injectable, Module } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { afterEach, describe, expect, it } from 'vitest';

describe('Systematic PostsService Investigation', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      try {
        await module.close();
      } catch (e) {}
    }
  });

  it('should compile PrismaService mock', async () => {
    console.log('Testing PrismaService mock...');
    const { PrismaService } = await import('../src/prisma/prisma.service');

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $connect: async () => {},
            $disconnect: async () => {},
            post: { findUnique: async () => null },
          },
        },
      ],
    }).compile();

    console.log(`✅ PrismaService mock compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile simple injectable with Redis', async () => {
    console.log('Testing simple injectable with Redis...');
    const { UPSTASH_REDIS } = await import('../src/lib/key');

    // Define a simple test class that uses Redis
    @Injectable()
    class SimpleRedisService {
      constructor(@Inject(UPSTASH_REDIS) private readonly redis: any) {}
    }

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        SimpleRedisService,
        {
          provide: UPSTASH_REDIS,
          useValue: { get: async () => null },
        },
      ],
    }).compile();

    console.log(`✅ Simple Redis service compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile simple class extending BaseRepository', async () => {
    console.log('Testing class extending BaseRepository...');
    const { BaseRepository } = await import('../src/common/base.repository');
    const { PrismaService } = await import('../src/prisma/prisma.service');

    // Simple class extending BaseRepository without any Redis
    @Injectable()
    class SimpleRepo extends BaseRepository<any, any> {
      constructor(prisma: PrismaService) {
        super(prisma, 'post', 'SimpleRepo');
      }
    }

    const mockPrisma = {
      $connect: async () => {},
      $disconnect: async () => {},
      post: { findUnique: async () => null, findMany: async () => [], count: async () => 0 },
    };

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        SimpleRepo,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    console.log(`✅ BaseRepository subclass compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile PostsService directly', async () => {
    console.log('Testing PostsService directly...');
    const { PostsService } = await import('../src/modules/post/post.service');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const { UPSTASH_REDIS } = await import('../src/lib/key');

    const mockPrisma = {
      $connect: async () => {},
      $disconnect: async () => {},
      post: {
        findUnique: async () => null,
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        create: async (d: any) => d.data,
        update: async (d: any) => d.data,
      },
    };

    const mockRedis = {
      get: async () => null,
      set: async () => 'OK',
    };

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        PostsService,
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

    console.log(`✅ PostsService compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 10000);
});
