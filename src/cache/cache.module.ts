import { Global, Module } from '@nestjs/common';

import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

import { UPSTASH_REDIS } from '../lib/key';
import { upstashRedis } from '../lib/upstash-client';

@Global()
@Module({
  imports: [
    // NestCacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => {
    //     const store = await redisStore({
    //       url: process.env.REDIS_URL,
    //       socket: {
    //         tls: true,
    //       },
    //     });
    //     console.log('✅ Redis store initialized');
    //     return {
    //       store,
    //       ttl: 60,
    //     };
    //   },
    // }),
  ],

  providers: [
    {
      provide: UPSTASH_REDIS,
      useValue: upstashRedis,
    },
  ],

  exports: [UPSTASH_REDIS],
})
export class CacheModule {}
