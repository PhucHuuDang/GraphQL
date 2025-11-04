import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorHelper } from './exceptions/prisma-error.helper';

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

export abstract class BaseRepository<
  T,
  ModelDelegate extends { [key: string]: any },
> {
  protected readonly logger = new Logger(BaseRepository.name);
  constructor(
    protected readonly model: any,
    loggerContext?: string,
  ) {
    this.logger = new Logger(loggerContext || this.constructor.name);
  }

  // READ OPERATIONS
  async findAll(params?: Prisma.SelectSubset<any, any>): Promise<T[]> {
    try {
      return await this.model.findMany(params);
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findAll');
    }
  }

  async findById(
    id: string,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required for findById');
      }
      return await this.model.findUnique({ where: { id }, ...(params as any) });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findById');
      return null as T;
    }
  }

  async findByIdOrFail(
    id: string,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T> {
    const results = await this.findById(id, params);

    if (!results) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return results;
  }

  async findOne(
    where: Prisma.SelectSubset<any, any>,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    try {
      if (!where) {
        throw new BadRequestException('Where is required for findOne');
      }

      return await this.model.findFirst({ where, ...(params as any) });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findOne');
    }
  }

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

  async findFirstWithConditions(
    condition: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    try {
      if (!condition) {
        throw new BadRequestException(
          'Condition is required for findFirstWithConditions',
        );
      }
      return await this.model.findFirst(condition);
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findFirstWithConditions');
    }
  }

  async findManyPaginated(
    params: PaginationParams & Prisma.SelectSubset<any, any>,
  ): Promise<PaginationResult<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        ...prismaParams
      } = params as {
        page?: number;
        limit?: number;
        [key: string]: any;
      };

      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limit < 1) {
        throw new BadRequestException('Limit must be greater than 0');
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          ...prismaParams,
          skip,
          take: limit,
        }),
        this.model.count({ where: prismaParams.where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findManyPaginated');
    }
  }

  //* CREATE OPERATIONS
  async create(data: any, include?: any): Promise<T> {
    try {
      if (!data) {
        throw new BadRequestException('Data is required for create');
      }
      return await this.model.create({ data, include });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'create');
    }
  }

  async createMany(
    data: any[],
    skipDuplicates: boolean = false,
  ): Promise<number> {
    try {
      if (!data || data.length === 0) {
        throw new BadRequestException('Data is required for createMany');
      }
      const result = await this.model.createMany({ data, skipDuplicates });

      return result.count;
    } catch (error) {
      PrismaErrorHelper.handle(error, 'createMany');
    }
  }

  async createManyAndReturn(data: any[]): Promise<T[]> {
    try {
      if (!data || data.length === 0) {
        throw new BadRequestException(
          'Data is required for createManyAndReturn',
        );
      }
      return await this.model.createManyAndReturn({ data });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'createManyAndReturn');
    }
  }

  //* Upsert operation && Update
  async upsert(
    where: any,
    create: any,
    update: any,
    include?: any,
  ): Promise<T> {
    try {
      if (!where || !create || !update) {
        throw new BadRequestException(
          'Where, create, and update are required for upsert',
        );
      }

      return await this.model.upsert({ where, create, update, include });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'upsert');
    }
  }

  async update(id: string, data: any, include?: any): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required for update');
      }
      if (!data) {
        throw new BadRequestException('Data is required for update');
      }
      return await this.model.update({ where: { id }, data, include });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'update');
    }
  }

  async updateMany(where: any, data: any): Promise<number> {
    try {
      if (!where) {
        throw new BadRequestException(
          'Where condition is required for updateMany',
        );
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Data is required for updateMany');
      }
      const result = await this.model.updateMany({ where, data });
      return result.count;
    } catch (error) {
      PrismaErrorHelper.handle(error, 'updateMany');
    }
  }

  //* Delete operation

  async delete(id: string): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required for delete');
      }
      return await this.model.delete({ where: { id } });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'delete');
      return null as unknown as T;
    }
  }

  async deleteMany(where: any): Promise<number> {
    try {
      if (!where) {
        throw new BadRequestException(
          'Where condition is required for deleteMany',
        );
      }
      const result = await this.model.deleteMany({ where });
      return result.count;
    } catch (error) {
      PrismaErrorHelper.handle(error, 'deleteMany');
    }
  }

  async softDeleted(id: string): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required for softDeleted');
      }

      return await this.model.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'softDeleted');
    }
  }

  async restore(id: string): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required for restore');
      }

      return await this.model.update({
        where: { id },
        data: { isDeleted: false, deletedAt: null },
      });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'restore');
    }
  }

  //* run multiple operations in a single transaction

  async transaction<R>(operations: (tx: any) => Promise<R>): Promise<R> {
    try {
      const prisma = this.model._client as PrismaService;
      return await prisma.$transaction(async (tx) => operations(tx));
    } catch (error) {
      PrismaErrorHelper.handle(error, 'transaction');
    }
  }

  async count(
    where?: Prisma.SelectSubset<Prisma.LikeCountArgs, Prisma.LikeCountArgs>,
  ): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'count');
      return 0;
    }
  }

  //* check if record exist
  async exists(
    where: Prisma.SelectSubset<Prisma.LikeCountArgs, Prisma.LikeCountArgs>,
  ): Promise<boolean> {
    try {
      const count = await this.model.count({ where });

      return count > 0;
    } catch (error) {
      PrismaErrorHelper.handle(error, 'exists');
    }
  }

  async aggregate(params: any): Promise<any> {
    try {
      return await this.model.aggregate(params);
    } catch (error) {
      PrismaErrorHelper.handle(error, 'aggregate');
    }
  }

  async groupBy(params: any): Promise<any> {
    try {
      return await this.model.groupBy(params);
    } catch (error) {
      PrismaErrorHelper.handle(error, 'groupBy');
    }
  }

  async bulkUpsert(
    records: Array<{ where: any; create: any; update: any }>,
  ): Promise<T[]> {
    try {
      if (!records || records.length === 0) {
        throw new BadRequestException('Records are required for bulkUpsert');
      }

      return await this.model.transaction(async (tx) => {
        const results = await Promise.all(
          records.map((record) => tx[this.model.name].upsert(record)),
        );

        return results;
      });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'bulkUpsert');
    }
  }

  async findWithRelations(id: string, include: any): Promise<T | null> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required ');
      }
      return await this.model.findUnique({
        where: { id },
        include,
      });
    } catch (error) {
      PrismaErrorHelper.handle(error, 'findWithRelations');
    }
  }

  // Raw query support
  async executeRaw(query: string, params?: any[]): Promise<any> {
    try {
      const prisma = this.model._client as PrismaService;
      return await prisma.$executeRawUnsafe(query, ...(params || []));
    } catch (error) {
      PrismaErrorHelper.handle(error, 'executeRaw');
    }
  }

  async queryRaw<R = any>(query: string, params?: any[]): Promise<R[]> {
    try {
      const prisma = this.model._client as PrismaService;

      return await prisma.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      PrismaErrorHelper.handle(error, 'queryRaw');
    }
  }
}
