// Core database exports
export {
  BaseRepository,
  type BulkOperationResult,
  type PaginationParams,
  type PaginationResult,
  type QueryOptions,
  type SortParams,
} from './database/base.repository';
export { PrismaModule } from './database/prisma.module';
export { PrismaService } from './database/prisma.service';

// Core cache exports
export { CacheModule } from './cache/cache.module';

// Core constants
export {
  AFTER_HOOK_KEY,
  AUTH_INSTANCE_KEY,
  BEFORE_HOOK_KEY,
  HOOK_KEY,
  IS_OPTIONAL_AUTH,
  IS_PUBLIC_AUTH,
} from './constants/auth.constants';
export { UPSTASH_REDIS } from './constants/injection-tokens';

// Core config
export { default as configuration } from './config/configuration';

// Core module
export { CoreModule } from './core.module';
