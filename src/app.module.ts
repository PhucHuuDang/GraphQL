import { Module } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';

import configuration from './core/config/configuration';
import { GqlConfigService } from './core/config/graphql-config.service';
import { ThrottlerConfigService } from './core/config/throttler-config.service';
import { CoreModule } from './core/core.module';
// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { CallbackModule } from './modules/callback/callback.module';
import { CategoryModule } from './modules/category/category.module';
import { CommentModule } from './modules/comment/comment.module';
import { HealthModule } from './modules/health/health.module';
import { PostModule } from './modules/post/post.module';
import { SessionModule } from './modules/session/session.module';
import { UserModule } from './modules/user/user.module';
import { VoteModule } from './modules/vote/vote.module';

/**
 * Third-party and Global Configuration Modules
 */
const GLOBAL_MODULES = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env.test', '.env.local', '.env'],
    load: [configuration],
  }),
  ThrottlerModule.forRootAsync({
    useClass: ThrottlerConfigService,
  }),
  GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    useClass: GqlConfigService,
  }),
];

/**
 * Core Infrastructure Modules
 */
const INFRA_MODULES = [
  CoreModule, // Shared Prisma + Cache
  HealthModule, // API Health status
];

/**
 * Feature-specific Business Logic Modules
 */
const FEATURE_MODULES = [
  UserModule,
  AuthModule,
  CategoryModule,
  PostModule,
  CommentModule,
  VoteModule,
  SessionModule,
  CallbackModule,
];

@Module({
  imports: [...GLOBAL_MODULES, ...INFRA_MODULES, ...FEATURE_MODULES],
  providers: [GqlConfigService, ThrottlerConfigService],
})
export class AppModule {}
