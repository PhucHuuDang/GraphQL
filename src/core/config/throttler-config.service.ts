import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const ttl = this.config.get<number>('throttler.ttl') || 60000;
    const limit = this.config.get<number>('throttler.limit') || 100;

    return {
      throttlers: [
        {
          name: 'default',
          ttl,
          limit,
        },
      ],
    };
  }
}
