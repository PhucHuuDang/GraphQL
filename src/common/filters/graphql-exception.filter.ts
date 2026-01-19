import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';

import { GqlArgumentsHost, GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { ResponseHelper } from '../helpers/response.helper';

/**
 * Global exception filter for GraphQL
 * Converts all exceptions to wrapped response format
 */
@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    // Only handle GraphQL requests
    if (host.getType<GqlContextType>() !== 'graphql') {
      throw exception;
    }

    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    this.logger.error(
      `GraphQL Error in ${info?.fieldName}:`,
      exception?.stack || exception?.message || exception,
    );

    // Handle HTTP exceptions (from guards, pipes, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;
      const message = (response?.message as string) || exception.message;

      // Handle authentication errors
      if (status === 401) {
        return ResponseHelper.unauthorized(
          message || 'You must be logged in to perform this action',
        );
      }

      // Handle forbidden errors
      if (status === 403) {
        return ResponseHelper.forbidden(
          message || 'You do not have permission to perform this action',
        );
      }

      // Handle not found errors
      if (status === 404) {
        return ResponseHelper.notFound(
          (response?.message as string) || exception.message || 'Resource not found',
        );
      }

      // Handle bad request / validation errors
      if (status === 400) {
        return ResponseHelper.error(message || 'Invalid request', 'BAD_REQUEST');
      }

      // Handle other HTTP exceptions
      return ResponseHelper.error(message || 'An error occurred', `HTTP_${status}`);
    }

    // Handle GraphQL errors
    if (exception instanceof GraphQLError) {
      return ResponseHelper.error(exception.message, 'GRAPHQL_ERROR');
    }

    // Handle Prisma errors
    if (exception?.code?.startsWith('P')) {
      const code = exception.code as string;
      if (code === 'P2002') {
        return ResponseHelper.error('Duplicate entry', 'DUPLICATE_ENTRY');
      }
      if (code === 'P2025') {
        return ResponseHelper.notFound('Record');
      }
      return ResponseHelper.error('Database error', code);
    }

    // Handle unknown errors
    return ResponseHelper.error(
      (exception?.message as string) || 'An unexpected error occurred',
      'INTERNAL_ERROR',
    );
  }
}
