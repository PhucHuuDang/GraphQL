import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthorsModule } from './authors/authors.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import GraphQLJSON from 'graphql-type-json';
import { auth } from './lib/auth';
// import { CacheModule } from '@nestjs/cache-manager';
import { CacheModule } from './cache/cache.module';
import { upstashRedis } from './lib/upstash-client';

import { Logger, LoggerModule } from 'nestjs-pino';
import { CallbackModule } from './callback/callback.module';
import { SessionModule } from './session/session.module';
import { BetterAuthService } from './auth/better-auth.service';
import { AUTH_INSTANCE_KEY } from './constants/auth.constants';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), '../schema.gql'),
      graphiql: true,
      // autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      resolvers: {
        JSON: GraphQLJSON,
      },

      introspection: true,

      context: ({ req, res }) => ({ req, res }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      skipProcessEnv: true,
    }),

    AuthorsModule,
    UserModule,
    CategoryModule,
    PrismaModule,
    // ⚠️ AuthModule MUST come before any custom controllers that might interfere

    CacheModule,

    CallbackModule,

    SessionModule,

    AuthModule,

    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: 'info',
    //   },
    // }),
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
