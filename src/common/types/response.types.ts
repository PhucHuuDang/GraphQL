// import { Type } from '@nestjs/class-transformer';
import { Type } from '@nestjs/common';

import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * Pagination metadata
 */
@ObjectType()
export class PaginationMeta {
  @Field(() => Int, { description: 'Total number of items' })
  total: number;

  @Field(() => Int, { description: 'Current page number' })
  page: number;

  @Field(() => Int, { description: 'Items per page' })
  limit: number;

  @Field(() => Int, { description: 'Total number of pages' })
  totalPages: number;

  @Field(() => Boolean, { description: 'Has next page' })
  hasNext: boolean;

  @Field(() => Boolean, { description: 'Has previous page' })
  hasPrev: boolean;
}

/**
 * Generic paginated response
 */
export function PaginatedResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [classRef], { description: 'Array of items' })
    data: T[];

    @Field(() => PaginationMeta, { description: 'Pagination metadata' })
    meta: PaginationMeta;

    @Field(() => Boolean, { defaultValue: true })
    success: boolean;

    @Field(() => String, { nullable: true })
    message?: string;
  }

  return PaginatedResponseClass;
}

/**
 * Generic single item response
 */
export function SingleResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class SingleResponseClass {
    @Field(() => classRef, { description: 'Response data', nullable: true })
    data?: T;

    @Field(() => Boolean, { defaultValue: true })
    success: boolean;

    @Field(() => String, { nullable: true })
    message?: string;
  }

  return SingleResponseClass;
}

/**
 * Generic array response (non-paginated)
 */
export function ArrayResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class ArrayResponseClass {
    @Field(() => [classRef], { description: 'Array of items' })
    data: T[];

    @Field(() => Int, { description: 'Total count' })
    count: number;

    @Field(() => Boolean, { defaultValue: true })
    success: boolean;

    @Field(() => String, { nullable: true })
    message?: string;
  }

  return ArrayResponseClass;
}

/**
 * Generic mutation response
 */
@ObjectType()
export class MutationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

/**
 * Delete response
 */
@ObjectType()
export class DeleteResponse extends MutationResponse {
  @Field(() => String, { nullable: true })
  deletedId?: string;
}

/**
 * Bulk operation response
 */
@ObjectType()
export class BulkOperationResponse extends MutationResponse {
  @Field(() => Int, { description: 'Number of affected records' })
  count: number;

  @Field(() => [String], {
    nullable: true,
    description: 'IDs of affected records',
  })
  affectedIds?: string[];
}

/**
 * Error response
 */
@ObjectType()
export class ErrorResponse {
  @Field(() => Boolean, { defaultValue: false })
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => String, { nullable: true })
  field?: string;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
