import { SetMetadata } from '@nestjs/common';

/**
 * Response type options
 */
export type ResponseType =
  | 'single'
  | 'array'
  | 'paginated'
  | 'delete'
  | 'bulk'
  | 'raw';

/**
 * Decorator to specify response transformation type
 * @param type - The type of response transformation
 * @param message - Optional custom message
 *
 * @example
 * @ResponseType('paginated', 'Posts retrieved successfully')
 * async getPosts() { ... }
 */
export const ResponseType = (type: ResponseType, message?: string) =>
  SetMetadata('response:metadata', { type, message });

/**
 * Mark response as single item
 * @example
 * @SingleItem('User found')
 * async getUser(@Args('id') id: string) { ... }
 */
export const SingleItem = (message?: string) =>
  SetMetadata('response:metadata', { type: 'single', message });

/**
 * Mark response as array
 * @example
 * @ArrayItems('Users retrieved')
 * async getUsers() { ... }
 */
export const ArrayItems = (message?: string) =>
  SetMetadata('response:metadata', { type: 'array', message });

/**
 * Mark response as paginated
 * @example
 * @Paginated('Posts retrieved')
 * async getPosts() { ... }
 */
export const Paginated = (message?: string) =>
  SetMetadata('response:metadata', { type: 'paginated', message });

/**
 * Mark response as delete operation
 * @example
 * @DeleteOperation('User deleted')
 * async deleteUser(@Args('id') id: string) { ... }
 */
export const DeleteOperation = (message?: string) =>
  SetMetadata('response:metadata', { type: 'delete', message });

/**
 * Mark response as bulk operation
 * @example
 * @BulkOperation('Users updated')
 * async updateManyUsers() { ... }
 */
export const BulkOperation = (message?: string) =>
  SetMetadata('response:metadata', { type: 'bulk', message });

/**
 * Skip automatic response transformation
 * @example
 * @RawResponse()
 * async getCustomData() { ... }
 */
export const RawResponse = () =>
  SetMetadata('response:metadata', { type: 'raw' });
