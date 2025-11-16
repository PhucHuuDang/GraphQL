import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { upstashRedis } from 'src/lib/upstash-client';
import { UPSTASH_REDIS } from 'src/lib/key';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          url: process.env.REDIS_URL,
          socket: {
            tls: true,
          },
        });
        console.log('✅ Redis store initialized');
        return {
          store,
          ttl: 60,
        };
      },
    }),
  ],

  providers: [
    {
      provide: UPSTASH_REDIS,
      useValue: upstashRedis,
    },
  ],

  exports: [NestCacheModule, UPSTASH_REDIS],
})
export class CacheModule {}
