/**
 * Debug test to isolate the PostModule hang issue
 */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';

import GraphQLJSON from 'graphql-type-json';

import { afterEach, describe, expect, it } from 'vitest';

import { UPSTASH_REDIS } from '../src/core/constants/injection-tokens';

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

describe('PostModule Isolation Debug', () => {
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

  it('should compile PostModule with correct dependencies and Redis mock', async () => {
    console.log('Testing PostModule with correct deps and Redis mock...');
    const { PostModule } = await import('../src/modules/post/post.module');
    const { PrismaModule } = await import('../src/core/database/prisma.module');
    const { SessionModule } = await import('../src/modules/session/session.module');
    const { CacheModule } = await import('../src/core/cache/cache.module');
    const { AuthModule } = await import('../src/modules/auth/auth.module');

    const start = Date.now();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CacheModule,
        AuthModule,
        SessionModule,
        PostModule,
      ],
    })
      .overrideProvider(UPSTASH_REDIS)
      .useValue(createMockRedis())
      .compile();
    console.log(`✅ PostModule compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 15000);

  it('should compile GraphQL + PostModule with Redis mock', async () => {
    console.log('Testing GraphQL + PostModule with Redis mock...');
    const { PostModule } = await import('../src/modules/post/post.module');
    const { PrismaModule } = await import('../src/core/database/prisma.module');
    const { SessionModule } = await import('../src/modules/session/session.module');
    const { CacheModule } = await import('../src/core/cache/cache.module');
    const { AuthModule } = await import('../src/modules/auth/auth.module');

    const start = Date.now();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CacheModule,
        AuthModule,
        SessionModule,
        PostModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          resolvers: { JSON: GraphQLJSON },
        }),
      ],
    })
      .overrideProvider(UPSTASH_REDIS)
      .useValue(createMockRedis())
      .compile();
    console.log(`✅ GraphQL + PostModule compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 20000);

  it('should compile AppModule with Redis mock', async () => {
    console.log('Testing AppModule with Redis mock...');
    const { AppModule } = await import('../src/app.module');

    const start = Date.now();
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UPSTASH_REDIS)
      .useValue(createMockRedis())
      .compile();
    console.log(`✅ AppModule compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 30000);
});
