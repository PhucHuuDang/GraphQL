import { join } from 'path';

import { Module } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { Logger, LoggerModule } from 'nestjs-pino';

import { CacheModule } from './cache/cache.module';
import { CallbackModule } from './callback/callback.module';
import { upstashRedis } from './lib/upstash-client';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { SessionModule } from './modules/session/session.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,

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

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      skipProcessEnv: true,
    }),

    UserModule,
    PostModule,
    PrismaModule,
    // ⚠️ AuthModule MUST come before any custom controllers that might interfere
    CacheModule,

    CallbackModule,

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
