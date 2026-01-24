/**
 * Mock Redis client for unit tests
 * Simulates Upstash Redis behavior
 */
import { Mock, vi } from 'vitest';

export interface MockRedis {
  get: Mock;
  set: Mock;
  del: Mock;
  incr: Mock;
  decr: Mock;
  expire: Mock;
  exists: Mock;
}

/**
 * Create a fresh Redis mock
 * Each test should call this to get isolated mock instances
 */
export const createRedisMock = (): MockRedis => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  incr: vi.fn().mockResolvedValue(1),
  decr: vi.fn().mockResolvedValue(0),
  expire: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0),
});

/**
 * Reset all mocks on a Redis mock instance
 */
export const resetRedisMock = (mock: MockRedis): void => {
  Object.values(mock).forEach((fn) => fn.mockReset());
};
