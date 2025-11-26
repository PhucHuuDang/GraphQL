import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthorsModule } from './authors/authors.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import GraphQLJSON from 'graphql-type-json';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
// import { CacheModule } from '@nestjs/cache-manager';
import { CacheModule } from './cache/cache.module';
import { upstashRedis } from './lib/upstash-client';

import { Logger, LoggerModule } from 'nestjs-pino';
// ⚠️ REMOVED: CallbackModule interferes with Better Auth's automatic OAuth handling
// import { CallbackModule } from './callback/callback.module';
import { SocialController } from './social/social.controller';
import { CallbackModule } from './callback/callback.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      // autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      resolvers: {
        JSON: GraphQLJSON,
      },

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

    CallbackModule,

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
