import { join } from 'path';

import { Module } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';

import GraphQLJSON from 'graphql-type-json';

import { CacheModule } from './cache/cache.module';
import { CallbackModule } from './callback/callback.module';
import configuration from './config/configuration';
import { upstashRedis } from './lib/upstash-client';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { HealthModule } from './modules/health/health.module';
import { PostModule } from './modules/post/post.module';
import { SessionModule } from './modules/session/session.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Configuration with type-safe config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.test', '.env.local', '.env'],
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get<number>('throttler.ttl') || 60000,
            limit: config.get<number>('throttler.limit') || 100,
          },
        ],
      }),
    }),

    // GraphQL with Apollo
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      sortSchema: true,
      playground: true,
      resolvers: {
        JSON: GraphQLJSON,
      },
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),

    // Core modules
    PrismaModule,
    HealthModule,

    // Feature modules
    UserModule,
    AuthModule,
    CategoryModule,
    PostModule,
    SessionModule,

    // Infrastructure modules
    CacheModule,
    CallbackModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'UPSTASH_REDIS',
      useValue: upstashRedis,
    },
  ],
})
export class AppModule {}
