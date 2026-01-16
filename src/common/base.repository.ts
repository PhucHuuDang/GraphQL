import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  ValidateArray,
  ValidateData,
  ValidateId,
  ValidatePagination,
  ValidateWhere,
} from './decorators/repository.decorators';

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface SortParams<T = any> {
  orderBy: Prisma.SelectSubset<any, any>;
}

export interface QueryOptions {
  include?: any;
  select?: any;
  orderBy?: any;
  where?: any;
}

export interface BulkOperationResult {
  count: number;
  success: boolean;
}

export abstract class BaseRepository<
  T,
  ModelDelegate extends { [key: string]: any },
> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: any,
    loggerContext?: string,
  ) {
    this.logger = new Logger(loggerContext || this.constructor.name);
  }

  /**
   * Helper method to build pagination metadata
   */
  protected buildPaginationMeta(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Helper method to calculate skip value for pagination
   */
  protected calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Get Prisma client instance
   */
  protected get prisma(): PrismaService {
    return this.model._client as PrismaService;
  }

  // ==================== READ OPERATIONS ====================

  /**
   * Find all records with optional filters
   */
  async findAll(params?: Prisma.SelectSubset<any, any>): Promise<T[]> {
    return await this.model.findMany(params);
  }

  /**
   * Find record by ID
   */
  @ValidateId()
  async findById(
    id: string,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    return await this.model.findUnique({ where: { id }, ...(params as any) });
  }

  /**
   * Find record by ID or throw NotFoundException
   */
  @ValidateId()
  async findByIdOrFail(
    id: string,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T> {
    const result = await this.findById(id, params);
    if (!result) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }
    return result;
  }

  /**
   * Find first record matching conditions
   */
  @ValidateWhere()
  async findOne(
    where: Prisma.SelectSubset<any, any>,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    return await this.model.findFirst({ where, ...(params as any) });
  }

  /**
   * Find unique record
   */
  async findUnique(
    where: Prisma.SelectSubset<any, any>,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    return await this.model.findUnique({ where, ...((params as any) ?? {}) });
  }

  /**
   * Find first record or throw NotFoundException
   */
  @ValidateWhere()
  async findOneOrFail(
    where: Prisma.SelectSubset<any, any>,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T> {
    const result = await this.findOne(where, params);
    if (!result) {
      throw new NotFoundException('Record not found');
    }
    return result;
  }

  /**
   * Find records with pagination
   */
  @ValidatePagination()
  async findManyPaginated(
    params: PaginationParams & Prisma.SelectSubset<any, any>,
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      ...prismaParams
    } = params as {
      page?: number;
      limit?: number;
      [key: string]: any;
    };

    const skip = this.calculateSkip(page, limit);

    const [data, total] = await Promise.all([
      this.model.findMany({ ...prismaParams, skip, take: limit }),
      this.model.count({ where: prismaParams.where }),
    ]);

    return {
      data,
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Count records matching conditions
   */
  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a single record
   */
  @ValidateData()
  async create(data: any, include?: any): Promise<T> {
    return await this.model.create({ data, include });
  }

  /**
   * Create multiple records
   */
  @ValidateArray()
  async createMany(
    data: any[],
    skipDuplicates: boolean = false,
  ): Promise<BulkOperationResult> {
    const result = await this.model.createMany({ data, skipDuplicates });
    return { count: result.count, success: true };
  }

  /**
   * Create multiple records and return them
   */
  @ValidateArray()
  async createManyAndReturn(data: any[]): Promise<T[]> {
    return await this.model.createManyAndReturn({ data });
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update a single record by ID
   */
  @ValidateId()
  @ValidateData(1)
  async update(id: string, data: any, include?: any): Promise<T> {
    return await this.model.update({ where: { id }, ...data, include });
  }

  /**
   * Update multiple records
   */
  @ValidateWhere()
  @ValidateData(1)
  async updateMany(
    where: Prisma.SelectSubset<any, any>,
    data: any,
  ): Promise<BulkOperationResult> {
    const result = await this.model.updateMany({ where, ...data });
    return { count: result.count, success: true };
  }

  /**
   * Upsert operation (update or create)
   */
  async upsert(
    where: any,
    create: any,
    update: any,
    include?: any,
  ): Promise<T> {
    if (!where || !create || !update) {
      throw new BadRequestException(
        'Where, create, and update are required for upsert',
      );
    }
    return await this.model.upsert({ where, create, update, include });
  }

  /**
   * Bulk upsert operations
   */
  @ValidateArray()
  async bulkUpsert(
    records: Array<{ where: any; create: any; update: any }>,
  ): Promise<T[]> {
    return await this.prisma.$transaction(
      records.map((record) => this.model.upsert(record)),
    );
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete a single record
   */
  @ValidateWhere()
  async delete(where: any): Promise<T> {
    return await this.model.delete({ ...where });
  }

  /**
   * Delete a record by ID
   */
  @ValidateId()
  async deleteById(id: string): Promise<T> {
    return await this.delete({ where: { id } });
  }

  /**
   * Delete multiple records
   */
  @ValidateWhere()
  async deleteMany(where: any): Promise<BulkOperationResult> {
    const result = await this.model.deleteMany({ where });
    return { count: result.count, success: true };
  }

  /**
   * Soft delete a record by ID
   */
  @ValidateId()
  async softDelete(id: string): Promise<T> {
    return await this.model.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted record by ID
   */
  @ValidateId()
  async restore(id: string): Promise<T> {
    return await this.model.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  /**
   * Find non-deleted records only
   */
  async findAllActive(params?: any): Promise<T[]> {
    return await this.findAll({
      ...params,
      where: { ...params?.where, isDeleted: false },
    });
  }

  /**
   * Find deleted records only
   */
  async findAllDeleted(params?: any): Promise<T[]> {
    return await this.findAll({
      ...params,
      where: { ...params?.where, isDeleted: true },
    });
  }

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Run multiple operations in a transaction
   */
  async transaction<R>(operations: (tx: any) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(async (tx) => operations(tx));
  }

  /**
   * Run multiple operations in parallel within a transaction
   */
  async transactionBatch<R>(
    operations: Array<(tx: any) => Promise<R>>,
  ): Promise<R[]> {
    return await this.prisma.$transaction(async (tx) => {
      return await Promise.all(operations.map((op) => op(tx)));
    });
  }

  // ==================== AGGREGATION OPERATIONS ====================

  /**
   * Perform aggregation operations
   */
  async aggregate(params: any): Promise<any> {
    return await this.model.aggregate(params);
  }

  /**
   * Group records by field(s)
   */
  async groupBy(params: any): Promise<any> {
    return await this.model.groupBy(params);
  }

  /**
   * Get min, max, avg, sum values
   */
  async getStats(
    field: string,
    where?: any,
  ): Promise<{
    min: number;
    max: number;
    avg: number;
    sum: number;
  }> {
    const result = await this.aggregate({
      where,
      _min: { [field]: true },
      _max: { [field]: true },
      _avg: { [field]: true },
      _sum: { [field]: true },
    });

    return {
      min: result._min[field] ?? 0,
      max: result._max[field] ?? 0,
      avg: result._avg[field] ?? 0,
      sum: result._sum[field] ?? 0,
    };
  }

  // ==================== UTILITY OPERATIONS ====================

  /**
   * Find record with relations
   */
  @ValidateId()
  async findWithRelations(id: string, include: any): Promise<T | null> {
    return await this.model.findUnique({ where: { id }, include });
  }

  /**
   * Batch find by IDs
   */
  @ValidateArray()
  async findByIds(ids: string[], options?: QueryOptions): Promise<T[]> {
    return await this.findAll({
      where: { id: { in: ids } },
      ...options,
    });
  }

  /**
   * Find or create a record
   */
  async findOrCreate(
    where: any,
    create: any,
    include?: any,
  ): Promise<{ record: T; created: boolean }> {
    const existing = await this.findUnique(where);
    if (existing) {
      return { record: existing, created: false };
    }

    const newRecord = await this.create(create, include);
    return { record: newRecord, created: true };
  }

  /**
   * Increment a numeric field
   */
  @ValidateId()
  async increment(id: string, field: string, value: number = 1): Promise<T> {
    return await this.update(id, {
      data: { [field]: { increment: value } },
    });
  }

  /**
   * Decrement a numeric field
   */
  @ValidateId()
  async decrement(id: string, field: string, value: number = 1): Promise<T> {
    return await this.update(id, {
      data: { [field]: { decrement: value } },
    });
  }

  // ==================== RAW QUERY OPERATIONS ====================

  /**
   * Execute raw SQL query
   */
  async executeRaw(query: string, params?: any[]): Promise<any> {
    return await this.prisma.$executeRawUnsafe(query, ...(params || []));
  }

  /**
   * Query raw SQL
   */
  async queryRaw<R = any>(query: string, params?: any[]): Promise<R[]> {
    return await this.prisma.$queryRawUnsafe(query, ...(params || []));
  }

  // ==================== SEARCH OPERATIONS ====================

  /**
   * Search records with full-text search
   */
  async search(
    searchTerm: string,
    searchFields: string[],
    options?: QueryOptions,
  ): Promise<T[]> {
    const searchConditions = searchFields.map((field) => ({
      [field]: { contains: searchTerm, mode: 'insensitive' as any },
    }));

    return await this.findAll({
      where: { OR: searchConditions, ...options?.where },
      ...options,
    });
  }

  /**
   * Paginated search
   */
  async searchPaginated(
    searchTerm: string,
    searchFields: string[],
    paginationParams: PaginationParams,
  ): Promise<PaginationResult<T>> {
    const searchConditions = searchFields.map((field) => ({
      [field]: { contains: searchTerm, mode: 'insensitive' as any },
    }));

    return await this.findManyPaginated({
      where: { OR: searchConditions },
      ...paginationParams,
    });
  }
}
