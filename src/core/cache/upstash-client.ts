// import { Redis } from '@upstash/redis';

// /**
//  * Upstash Redis client
//  *
//  * In test mode (NODE_ENV=test), this returns null to prevent external connections.
//  * The test-setup.ts provides a mock implementation via overrideProvider.
//  */
// export const upstashRedis =
//   process.env.NODE_ENV === 'test'
//     ? (null as unknown as Redis) // Mock will be provided via overrideProvider in tests
//     : new Redis({
//         url: process.env.UPSTASH_REDIS_REST_URL,
//         token: process.env.UPSTASH_REDIS_REST_TOKEN,
//       });

import { Redis } from '@upstash/redis';

function createUpstashRedis(): Redis | null {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[Upstash Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Redis disabled.',
    );
    return null;
  }

  return new Redis({ url, token });
}

export const upstashRedis = createUpstashRedis();
