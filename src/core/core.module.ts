import { Module } from '@nestjs/common';

import { CacheModule } from './cache/cache.module';
import { PrismaModule } from './database/prisma.module';

/**
 * Core Module
 * Aggregates all infrastructure modules (database, cache, config).
 * Imported once by AppModule.
 */
@Module({
  imports: [PrismaModule, CacheModule],
  exports: [PrismaModule, CacheModule],
})
export class CoreModule {}
