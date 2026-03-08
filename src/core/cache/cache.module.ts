import { Global, Module } from '@nestjs/common';

import { UPSTASH_REDIS } from '../constants/injection-tokens';

import { upstashRedis } from './upstash-client';

@Global()
@Module({
  imports: [],

  providers: [
    {
      provide: UPSTASH_REDIS,
      useValue: upstashRedis,
    },
  ],

  exports: [UPSTASH_REDIS],
})
export class CacheModule {}
