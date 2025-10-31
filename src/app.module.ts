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
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      skipProcessEnv: true,
    }),

    AuthorsModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    UserModule,

    CategoryModule,

    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
