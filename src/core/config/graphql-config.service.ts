import { join } from 'path';

import { Injectable } from '@nestjs/common';

import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import GraphQLJSON from 'graphql-type-json';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createGqlOptions(): ApolloDriverConfig {
    const isProduction = this.config.get<boolean>('app.isProduction');

    return {
      autoSchemaFile: isProduction ? true : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false, // Control manually via plugins
      resolvers: {
        JSON: GraphQLJSON,
      },
      // Security hardening
      introspection: !isProduction,
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
      plugins: [
        isProduction
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
    };
  }
}
