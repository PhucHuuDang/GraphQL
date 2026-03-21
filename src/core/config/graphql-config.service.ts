import { join } from 'path';

import { Injectable } from '@nestjs/common';

import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { DocumentNode, GraphQLError, Kind, ValidationContext, ValidationRule } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * Custom depth-limiting validation rule for GraphQL queries.
 * Rejects queries that exceed the maximum depth to prevent DoS attacks.
 */
function depthLimitRule(maxDepth: number): (context: ValidationContext) => any {
  return (context: ValidationContext) => {
    const depths = new Map<string, number>();

    function checkDepth(
      node: any,
      fragments: Record<string, any>,
      currentDepth: number,
      operationName: string,
    ): number {
      if (operationName === 'IntrospectionQuery') {
        return 0;
      }

      if (currentDepth > maxDepth) {
        context.reportError(
          new GraphQLError(
            `Query depth of ${currentDepth} exceeds maximum allowed depth of ${maxDepth}`,
            { nodes: [node] },
          ),
        );
        return currentDepth;
      }

      if (!node.selectionSet) return currentDepth;

      let maxChildDepth = currentDepth;
      for (const selection of node.selectionSet.selections) {
        if (selection.kind === Kind.FIELD) {
          const fieldDepth = checkDepth(selection, fragments, currentDepth + 1, operationName);
          maxChildDepth = Math.max(maxChildDepth, fieldDepth);
        } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
          const fragment = fragments[selection.name.value];
          if (fragment) {
            const fragDepth = checkDepth(fragment, fragments, currentDepth, operationName);
            maxChildDepth = Math.max(maxChildDepth, fragDepth);
          }
        } else if (selection.kind === Kind.INLINE_FRAGMENT) {
          const inlineDepth = checkDepth(selection, fragments, currentDepth, operationName);
          maxChildDepth = Math.max(maxChildDepth, inlineDepth);
        }
      }
      return maxChildDepth;
    }

    return {
      Document(node: DocumentNode) {
        const fragments: Record<string, any> = {};
        for (const def of node.definitions) {
          if (def.kind === Kind.FRAGMENT_DEFINITION) {
            fragments[def.name.value] = def;
          }
        }

        for (const def of node.definitions) {
          if (def.kind === Kind.OPERATION_DEFINITION) {
            const name = def.name?.value || 'anonymous';
            const depth = checkDepth(def, fragments, 0, name);
            depths.set(name, depth);
          }
        }
      },
    };
  };
}

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createGqlOptions(): ApolloDriverConfig {
    const isProduction = this.config.get<boolean>('app.isProduction');
    const maxQueryDepth = this.config.get<number>('graphql.maxQueryDepth') || 7;

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
      // Query depth limiting to prevent DoS attacks
      validationRules: [depthLimitRule(maxQueryDepth) as unknown as ValidationRule],
      plugins: [
        isProduction
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
    };
  }
}
