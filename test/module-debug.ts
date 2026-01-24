/**
 * Debug script to isolate which module is causing the hang
 * Run with: NODE_ENV=test SKIP_PRISMA_CONNECT=true npx ts-node --esm test/module-debug.ts
 */

process.env.NODE_ENV = 'test';
process.env.SKIP_PRISMA_CONNECT = 'true';

import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import GraphQLJSON from 'graphql-type-json';

async function testModules() {
  console.log('Starting module isolation tests...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SKIP_PRISMA_CONNECT:', process.env.SKIP_PRISMA_CONNECT);

  // Test 1: ConfigModule alone
  console.log('\n=== Test 1: ConfigModule ===');
  try {
    const start1 = Date.now();
    const mod1 = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();
    console.log(`✅ ConfigModule compiled in ${Date.now() - start1}ms`);
    await mod1.close();
  } catch (err) {
    console.error('❌ ConfigModule failed:', err);
  }

  // Test 2: PrismaModule
  console.log('\n=== Test 2: PrismaModule ===');
  try {
    const { PrismaModule } = await import('../src/prisma/prisma.module');
    const start2 = Date.now();
    const mod2 = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
    }).compile();
    console.log(`✅ PrismaModule compiled in ${Date.now() - start2}ms`);
    await mod2.close();
  } catch (err) {
    console.error('❌ PrismaModule failed:', err);
  }

  // Test 3: CacheModule
  console.log('\n=== Test 3: CacheModule ===');
  try {
    const { CacheModule } = await import('../src/cache/cache.module');
    const start3 = Date.now();
    const mod3 = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), CacheModule],
    }).compile();
    console.log(`✅ CacheModule compiled in ${Date.now() - start3}ms`);
    await mod3.close();
  } catch (err) {
    console.error('❌ CacheModule failed:', err);
  }

  // Test 4: AuthModule
  console.log('\n=== Test 4: AuthModule ===');
  try {
    const { AuthModule } = await import('../src/modules/auth/auth.module');
    const { PrismaModule } = await import('../src/prisma/prisma.module');
    const start4 = Date.now();
    const mod4 = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule],
    }).compile();
    console.log(`✅ AuthModule compiled in ${Date.now() - start4}ms`);
    await mod4.close();
  } catch (err) {
    console.error('❌ AuthModule failed:', err);
  }

  // Test 5: GraphQLModule (this might be the culprit)
  console.log('\n=== Test 5: GraphQLModule ===');
  try {
    const { UserResolver } = await import('../src/modules/user/user.resolver');
    const { UserService } = await import('../src/modules/user/user.service');
    const { PrismaModule } = await import('../src/prisma/prisma.module');
    const { AuthModule } = await import('../src/modules/auth/auth.module');
    const { CacheModule } = await import('../src/cache/cache.module');

    const start5 = Date.now();
    const mod5 = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CacheModule,
        AuthModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          resolvers: { JSON: GraphQLJSON },
        }),
      ],
      providers: [UserResolver, UserService],
    }).compile();
    console.log(`✅ GraphQLModule compiled in ${Date.now() - start5}ms`);
    await mod5.close();
  } catch (err) {
    console.error('❌ GraphQLModule failed:', err);
  }

  // Test 6: Full AppModule
  console.log('\n=== Test 6: Full AppModule ===');
  try {
    const { AppModule } = await import('../src/app.module');
    const start6 = Date.now();
    const mod6 = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    console.log(`✅ Full AppModule compiled in ${Date.now() - start6}ms`);
    await mod6.close();
  } catch (err) {
    console.error('❌ Full AppModule failed:', err);
  }

  console.log('\n=== All tests complete ===');
  process.exit(0);
}

// Add timeout
const timeout = setTimeout(() => {
  console.error('\n❌ TIMEOUT: Script hung for 60 seconds');
  process.exit(1);
}, 60000);

testModules()
  .then(() => {
    clearTimeout(timeout);
  })
  .catch((err) => {
    console.error('Script error:', err);
    clearTimeout(timeout);
    process.exit(1);
  });
