import {
  ArgumentsHost,
  Catch,
  ContextType,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/library';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Response } from 'express';

interface PrismaErrorMapping {
  status: HttpStatus;
  message: string;
  code?: string;
}

@Catch(
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType<GqlContextType>();

    this.logger.error({
      type: exception.constructor.name,
      code: exception.code,
      message: exception.message,
      meta: exception.meta,
    });

    const errorMapping = this.mapPrismaError(exception);

    // Handle GraphQL context
    if (contextType === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);

      throw new GraphQLError(errorMapping.message, {
        extensions: {
          code: errorMapping.code || 'INTERNAL_SERVER_ERROR',
          statusCode: errorMapping.status,
          originalError: {
            type: exception.constructor.name,
            code: exception.code,
            meta: exception.meta,
          },
        },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(errorMapping.status).json({
      statusCode: errorMapping.status,
      message: errorMapping.message,
      error: errorMapping.code || 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  private mapPrismaError(error: any): PrismaErrorMapping {
    // Handle PrismaClientKnownRequestError
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        // ==================== Connection Errors ====================
        case 'P1000':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Authentication failed at database',
            code: 'DATABASE_AUTH_FAILED',
          };
        case 'P1001':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: "Can't reach database server",
            code: 'DATABASE_UNREACHABLE',
          };
        case 'P1002':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Database server connection timeout',
            code: 'DATABASE_TIMEOUT',
          };
        case 'P1003':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Database does not exist',
            code: 'DATABASE_NOT_FOUND',
          };
        case 'P1008':
          return {
            status: HttpStatus.REQUEST_TIMEOUT,
            message: 'Operations timed out',
            code: 'OPERATION_TIMEOUT',
          };
        case 'P1009':
          return {
            status: HttpStatus.CONFLICT,
            message: 'Database already exists',
            code: 'DATABASE_ALREADY_EXISTS',
          };
        case 'P1010':
          return {
            status: HttpStatus.FORBIDDEN,
            message: 'Access denied for user',
            code: 'DATABASE_ACCESS_DENIED',
          };
        case 'P1011':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Error opening a TLS connection',
            code: 'TLS_CONNECTION_ERROR',
          };
        case 'P1017':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Server has closed the connection',
            code: 'DATABASE_CONNECTION_CLOSED',
          };

        // ==================== Data Errors ====================
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Record not found',
            code: 'RECORD_NOT_FOUND',
          };

        // ==================== Constraint Violations ====================
        case 'P2002': {
          const target = error.meta?.target;
          const fields = Array.isArray(target)
            ? target.join(', ')
            : target || 'unknown';

          return {
            status: HttpStatus.CONFLICT,
            message: `A record with this ${fields as string} already exists`,
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
          };
        }
        case 'P2003': {
          const field = error.meta?.field_name || 'unknown';
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `Invalid reference: ${field as string}`,
            code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
          };
        }
        case 'P2004':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'A constraint failed on the database',
            code: 'CONSTRAINT_FAILED',
          };

        // ==================== Data Validation Errors ====================
        case 'P2005':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid value stored in the database',
            code: 'INVALID_STORED_VALUE',
          };
        case 'P2006':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Provided value is invalid',
            code: 'INVALID_VALUE',
          };
        case 'P2007':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Data validation error',
            code: 'VALIDATION_ERROR',
          };
        case 'P2008':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Failed to parse query',
            code: 'QUERY_PARSE_ERROR',
          };
        case 'P2009':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Failed to validate query',
            code: 'QUERY_VALIDATION_ERROR',
          };
        case 'P2010':
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Raw query failed',
            code: 'RAW_QUERY_FAILED',
          };
        case 'P2011':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Null constraint violation',
            code: 'NULL_CONSTRAINT_VIOLATION',
          };
        case 'P2012':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Missing required value',
            code: 'MISSING_REQUIRED_VALUE',
          };
        case 'P2013':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Missing required argument',
            code: 'MISSING_REQUIRED_ARGUMENT',
          };
        case 'P2014':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Required relation violation',
            code: 'REQUIRED_RELATION_VIOLATION',
          };
        case 'P2015':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Related record not found',
            code: 'RELATED_RECORD_NOT_FOUND',
          };
        case 'P2016':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Query interpretation error',
            code: 'QUERY_INTERPRETATION_ERROR',
          };
        case 'P2017':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Records for relation not connected',
            code: 'RELATION_NOT_CONNECTED',
          };
        case 'P2018':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Required connected records not found',
            code: 'CONNECTED_RECORDS_NOT_FOUND',
          };
        case 'P2019':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Input error',
            code: 'INPUT_ERROR',
          };
        case 'P2020':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Value out of range',
            code: 'VALUE_OUT_OF_RANGE',
          };
        case 'P2021':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Table does not exist',
            code: 'TABLE_NOT_FOUND',
          };
        case 'P2022':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Column does not exist',
            code: 'COLUMN_NOT_FOUND',
          };
        case 'P2023':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Inconsistent column data',
            code: 'INCONSISTENT_COLUMN_DATA',
          };
        case 'P2024':
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Connection pool timeout',
            code: 'CONNECTION_POOL_TIMEOUT',
          };
        case 'P2026':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Unsupported database feature',
            code: 'UNSUPPORTED_FEATURE',
          };
        case 'P2027':
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Multiple database errors occurred',
            code: 'MULTIPLE_ERRORS',
          };
        case 'P2028':
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Transaction API error',
            code: 'TRANSACTION_API_ERROR',
          };
        case 'P2030':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Cannot find fulltext index',
            code: 'FULLTEXT_INDEX_NOT_FOUND',
          };
        case 'P2033':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Number out of range',
            code: 'NUMBER_OUT_OF_RANGE',
          };
        case 'P2034':
          return {
            status: HttpStatus.CONFLICT,
            message: 'Transaction failed due to write conflict',
            code: 'WRITE_CONFLICT',
          };

        default:
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Database error: ${error.message}`,
            code: `PRISMA_${error.code}`,
          };
      }
    }

    // Handle PrismaClientInitializationError
    if (error instanceof PrismaClientInitializationError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database initialization failed',
        code: 'DATABASE_INIT_FAILED',
      };
    }

    // Handle PrismaClientValidationError
    if (error instanceof PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid database query',
        code: 'INVALID_QUERY',
      };
    }

    // Handle PrismaClientRustPanicError
    if (error instanceof PrismaClientRustPanicError) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Critical database engine error',
        code: 'DATABASE_ENGINE_ERROR',
      };
    }

    // Fallback
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    };
  }
}
