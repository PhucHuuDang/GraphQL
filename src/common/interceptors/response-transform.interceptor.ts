import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationResult } from '../base.repository';

/**
 * Response metadata from decorator
 */
interface ResponseMetadata {
  type?: 'single' | 'array' | 'paginated' | 'delete' | 'bulk' | 'raw';
  message?: string;
}

/**
 * Check if response is a pagination result
 */
function isPaginationResult(data: any): data is PaginationResult<any> {
  return (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    'meta' in data &&
    Array.isArray(data.data) &&
    typeof data.meta === 'object' &&
    'total' in data.meta &&
    'page' in data.meta
  );
}

/**
 * Check if response is already transformed
 */
function isAlreadyTransformed(data: any): boolean {
  return data && typeof data === 'object' && 'success' in data && typeof data.success === 'boolean';
}

/**
 * Check if it's a delete operation
 */
function isDeleteResponse(data: any, operationName: string): boolean {
  return (
    operationName?.toLowerCase().includes('delete') ||
    (data && typeof data === 'object' && 'isDeleted' in data)
  );
}

/**
 * Check if it's a bulk operation
 */
function isBulkResponse(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    'count' in data &&
    typeof data.count === 'number' &&
    !Array.isArray(data) &&
    !('data' in data)
  );
}

/**
 * Global Response Transform Interceptor
 * Automatically wraps all GraphQL responses in standard format
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const operationName = info?.fieldName || '';
    const operationType = info?.operation?.operation || 'query';

    // Get response metadata from custom decorator if exists
    const metadata: ResponseMetadata =
      Reflect.getMetadata('response:metadata', context.getHandler()) || {};

    return next.handle().pipe(
      map((data) => {
        // Skip transformation if data is null or undefined
        if (data === null || data === undefined) {
          return {
            success: false,
            message: 'No data found',
            data: null,
          };
        }

        // Skip if already transformed
        if (isAlreadyTransformed(data)) {
          return data;
        }

        // If metadata explicitly says 'raw', return as-is
        if (metadata.type === 'raw') {
          return data;
        }

        // Transform based on response type
        return this.transformResponse(data, operationName, operationType, metadata);
      }),
    );
  }

  private transformResponse(
    data: any,
    operationName: string,
    operationType: string,
    metadata: ResponseMetadata,
  ): any {
    const defaultMessage = this.getDefaultMessage(operationName, operationType);
    const message = metadata.message || defaultMessage;

    // 1. Handle Pagination Result
    if (metadata.type === 'paginated' || isPaginationResult(data)) {
      return {
        success: true,
        message,
        data: data.data,
        meta: data.meta,
      };
    }

    // 2. Handle Bulk Operations
    if (metadata.type === 'bulk' || isBulkResponse(data)) {
      return {
        success: true,
        message,
        count: data.count,
        affectedIds: data.affectedIds,
      };
    }

    // 3. Handle Delete Operations
    if (metadata.type === 'delete' || isDeleteResponse(data, operationName)) {
      return {
        success: true,
        message,
        deletedId: data.id || data._id || data.deletedId,
      };
    }

    // 4. Handle Arrays
    if (metadata.type === 'array' || Array.isArray(data)) {
      return {
        success: true,
        message,
        data,
        count: data.length,
      };
    }

    // 5. Handle Single Objects
    if (metadata.type === 'single' || (data && typeof data === 'object')) {
      return {
        success: true,
        message,
        data,
      };
    }

    // 6. Default: wrap primitive values
    return {
      success: true,
      message,
      data,
    };
  }

  private getDefaultMessage(operationName: string, operationType: string): string {
    if (operationType === 'mutation') {
      if (operationName.toLowerCase().includes('create')) {
        return 'Resource created successfully';
      }
      if (operationName.toLowerCase().includes('update')) {
        return 'Resource updated successfully';
      }
      if (operationName.toLowerCase().includes('delete')) {
        return 'Resource deleted successfully';
      }
      return 'Operation completed successfully';
    }

    // Query
    return 'Data retrieved successfully';
  }
}
