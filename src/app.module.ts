import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthorsModule } from './authors/authors.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // playground: false,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      autoSchemaFile: true,

      sortSchema: true,
      playground: true, // bật playground
    }),

    AuthorsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
