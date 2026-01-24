/**
 * Minimal test to isolate the issue
 */
import { Inject, Injectable } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { afterEach, describe, expect, it } from 'vitest';

// Import only core NestJS stuff - no project imports
const MOCK_REDIS_KEY = 'MOCK_REDIS';

// Create a completely isolated class
@Injectable()
class IsolatedService {
  constructor(@Inject(MOCK_REDIS_KEY) private readonly redis: any) {}

  async testMethod() {
    return 'working';
  }
}

describe('Completely Isolated Test', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      try {
        await module.close();
      } catch (e) {}
    }
  });

  it('should compile isolated service', async () => {
    console.log('Testing completely isolated service...');

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        IsolatedService,
        {
          provide: MOCK_REDIS_KEY,
          useValue: { get: async () => null },
        },
      ],
    }).compile();

    console.log(`✅ Isolated service compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile after importing PrismaService', async () => {
    console.log('Testing after PrismaService import...');
    const { PrismaService } = await import('../src/prisma/prisma.service');

    @Injectable()
    class ServiceWithPrisma {
      constructor(private readonly prisma: PrismaService) {}
    }

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        ServiceWithPrisma,
        {
          provide: PrismaService,
          useValue: { $connect: async () => {} },
        },
      ],
    }).compile();

    console.log(`✅ ServiceWithPrisma compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile after importing generated Prisma types', async () => {
    console.log('Testing after generated Prisma types import...');
    const { Post, Prisma } = await import('../generated/prisma');

    console.log('Generated types imported successfully');
    console.log('Post type exists:', typeof Post);

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        {
          provide: 'TEST',
          useValue: 'test',
        },
      ],
    }).compile();

    console.log(`✅ Module after Prisma types import compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);

  it('should compile after importing BaseRepository', async () => {
    console.log('Testing after BaseRepository import...');
    const { BaseRepository } = await import('../src/common/base.repository');

    console.log('BaseRepository imported successfully');

    const start = Date.now();
    module = await Test.createTestingModule({
      providers: [
        {
          provide: 'TEST',
          useValue: 'test',
        },
      ],
    }).compile();

    console.log(`✅ Module after BaseRepository import compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);
});
