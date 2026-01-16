import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import GraphQLJSON from 'graphql-type-json';
import { CacheModule } from './cache/cache.module';
import { upstashRedis } from './lib/upstash-client';

// Modules
import { Logger, LoggerModule } from 'nestjs-pino';
import { CallbackModule } from './callback/callback.module';
import { SessionModule } from './modules/session/session.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';

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
