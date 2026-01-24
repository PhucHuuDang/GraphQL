/**
 * Debug test to verify the dynamicRegisterEnum is causing the hang
 */
import { describe, expect, it } from 'vitest';

describe('Post DTO Import Test', () => {
  it('should import PostFiltersInput without hanging', async () => {
    console.log('Testing PostFiltersInput import...');
    const start = Date.now();
    const { PostFiltersInput } = await import('../src/modules/post/dto/post-filters.dto');
    console.log(`✅ PostFiltersInput imported in ${Date.now() - start}ms`);
    expect(PostFiltersInput).toBeDefined();
  }, 5000);

  it('should import PostResolver without hanging', async () => {
    console.log('Testing PostResolver import...');
    const start = Date.now();
    const { PostResolver } = await import('../src/modules/post/post.resolver');
    console.log(`✅ PostResolver imported in ${Date.now() - start}ms`);
    expect(PostResolver).toBeDefined();
  }, 5000);

  it('should import PostModule without hanging', async () => {
    console.log('Testing PostModule import...');
    const start = Date.now();
    const { PostModule } = await import('../src/modules/post/post.module');
    console.log(`✅ PostModule imported in ${Date.now() - start}ms`);
    expect(PostModule).toBeDefined();
  }, 5000);
});
