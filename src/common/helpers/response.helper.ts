import { PaginationResult } from '../base.repository';

/**
 * Response helper utilities
 */
export class ResponseHelper {
  /**
   * Create a success response for a single item
   */
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message: message || 'Operation completed successfully',
    };
  }

  /**
   * Create a success response for an array
   */
  static successArray<T>(data: T[], message?: string) {
    return {
      success: true,
      data,
      count: data.length,
      message: message || 'Data retrieved successfully',
    };
  }

  /**
   * Create a paginated success response
   */
  static successPaginated<T>(result: PaginationResult<T>, message?: string) {
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      message: message || 'Data retrieved successfully',
    };
  }

  /**
   * Create a delete success response
   */
  static successDelete(deletedId: string, message?: string) {
    return {
      success: true,
      message: message || 'Record deleted successfully',
      deletedId,
    };
  }

  /**
   * Create a bulk operation response
   */
  static successBulk(count: number, affectedIds?: string[], message?: string) {
    return {
      success: true,
      message: message || `${count} record(s) affected`,
      count,
      affectedIds,
    };
  }

  /**
   * Create an error response
   */
  static error(message: string, code?: string, field?: string) {
    return {
      success: false,
      message,
      code,
      field,
    };
  }

  /**
   * Create a validation error response
   */
  static validationError(errors: string[], message?: string) {
    return {
      success: false,
      message: message || 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    };
  }

  /**
   * Transform Prisma pagination result to API response
   */
  static transformPagination<T>(result: PaginationResult<T>) {
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
        hasNext: result.meta.hasNext,
        hasPrev: result.meta.hasPrev,
      },
    };
  }

  /**
   * Create not found response
   */
  static notFound(resource: string = 'Resource') {
    return {
      success: false,
      message: `${resource} not found`,
      code: 'NOT_FOUND',
    };
  }

  /**
   * Create unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized access') {
    return {
      success: false,
      message,
      code: 'UNAUTHORIZED',
    };
  }

  /**
   * Create forbidden response
   */
  static forbidden(message: string = 'Access forbidden') {
    return {
      success: false,
      message,
      code: 'FORBIDDEN',
    };
  }
}
