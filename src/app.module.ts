import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthorsModule } from './authors/authors.module.js';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module.js';
import { CategoryModule } from './category/category.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import GraphQLJSON from 'graphql-type-json';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth.js';
// import { CacheModule } from '@nestjs/cache-manager';
import { CacheModule } from './cache/cache.module.js';
import { upstashRedis } from './lib/upstash-client.js';

import { Logger, LoggerModule } from 'nestjs-pino';
import { CallbackModule } from './callback/callback.module.js';
import { SessionModule } from './session/session.module.js';

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
    AuthModule.forRoot({
      auth,
      isGlobal: true,
      disableGlobalAuthGuard: true,
    }),

    CacheModule,

    // CallbackModule,

    SessionModule,

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
