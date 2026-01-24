/**
 * Minimal test to verify Test.createTestingModule works in Vitest
 */
import { Injectable, Module } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { afterEach, describe, expect, it } from 'vitest';

// Simple test service
@Injectable()
class TestService {
  getHello(): string {
    return 'Hello World!';
  }
}

// Simple test module
@Module({
  providers: [TestService],
  exports: [TestService],
})
class TestModule {}

describe('Minimal Vitest NestJS Test', () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile a minimal test module', async () => {
    console.log('Testing minimal module compilation...');
    const start = Date.now();

    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    console.log(`✅ Minimal module compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();

    const testService = module.get(TestService);
    expect(testService.getHello()).toBe('Hello World!');
  }, 5000);

  it('should compile with inline providers', async () => {
    console.log('Testing inline providers compilation...');
    const start = Date.now();

    module = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    console.log(`✅ Inline providers compiled in ${Date.now() - start}ms`);
    expect(module).toBeDefined();
  }, 5000);
});
