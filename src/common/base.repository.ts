import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

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
    return await this.model.findMany(params);
  }

  async findById(
    id: string,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    if (!id) {
      throw new BadRequestException('Id is required for findById');
    }
    return await this.model.findUnique({ where: { id }, ...(params as any) });
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
    if (!where) {
      throw new BadRequestException('Where is required for findOne');
    }

    return await this.model.findFirst({ where, ...(params as any) });
  }

  async findUnique(
    where: Prisma.SelectSubset<any, any>,
    params?: Prisma.SelectSubset<any, any>,
  ): Promise<T | null> {
    return await this.model.findUnique({ where, ...((params as any) ?? {}) });
  }

  async findFirst(
    where: Prisma.SelectSubset<any, any>,
    params: Prisma.SelectSubset<any, any> = {},
  ): Promise<T | null> {
    return await this.model.findFirst({ where, ...(params as any) });
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
    if (!condition) {
      throw new BadRequestException(
        'Condition is required for findFirstWithConditions',
      );
    }
    return await this.model.findFirst(condition);
  }

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
  }

  //* CREATE OPERATIONS
  async create(data: any, include?: any): Promise<T> {
    if (!data) {
      throw new BadRequestException('Data is required for create');
    }
    return await this.model.create({ data, include });
  }

  async createMany(
    data: any[],
    skipDuplicates: boolean = false,
  ): Promise<number> {
    if (!data || data.length === 0) {
      throw new BadRequestException('Data is required for createMany');
    }
    const result = await this.model.createMany({ data, skipDuplicates });

    return result.count;
  }

  async createManyAndReturn(data: any[]): Promise<T[]> {
    if (!data || data.length === 0) {
      throw new BadRequestException('Data is required for createManyAndReturn');
    }
    return await this.model.createManyAndReturn({ data });
  }

  //* Upsert operation && Update
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

  async update(id: string, data: any, include?: any): Promise<T> {
    if (!id) {
      throw new BadRequestException('Id is required for update');
    }
    if (!data) {
      throw new BadRequestException('Data is required for update');
    }
    return await this.model.update({ where: { id }, ...data, include });
  }

  async updateMany(
    where: Prisma.SelectSubset<any, any>,
    data: any,
  ): Promise<number> {
    if (!where) {
      throw new BadRequestException(
        'Where condition is required for updateMany',
      );
    }
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Data is required for updateMany');
    }
    const result = await this.model.updateMany({ where, ...data });
    return result.count;
  }

  //* Delete operation

  async delete(where: any): Promise<T> {
    if (!where) {
      throw new BadRequestException('Where is required for delete');
    }
    return await this.model.delete({ ...where });
  }

  async deleteMany(where: any): Promise<number> {
    if (!where) {
      throw new BadRequestException(
        'Where condition is required for deleteMany',
      );
    }
    const result = await this.model.deleteMany({ where });
    return result.count;
  }

  async softDeleted(id: string): Promise<T> {
    if (!id) {
      throw new BadRequestException('Id is required for softDeleted');
    }

    return await this.model.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<T> {
    if (!id) {
      throw new BadRequestException('Id is required for restore');
    }

    return await this.model.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  //* run multiple operations in a single transaction

  async transaction<R>(operations: (tx: any) => Promise<R>): Promise<R> {
    const prisma = this.model._client as PrismaService;
    return await prisma.$transaction(async (tx) => operations(tx));
  }

  // async count(
  //   where?: Prisma.SelectSubset<Prisma.$VotePayload, Prisma.$Vote>,
  // ): Promise<number> {
  //   try {
  //     return await this.model.count({ where });
  //   } catch (error) {
  //     PrismaErrorHelper.handle(error, 'count');
  //     return 0;
  //   }
  // }

  //* check if record exist
  async exists(
    where: Prisma.SelectSubset<Prisma.VoteCountArgs, Prisma.VoteCountArgs>,
  ): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async aggregate(params: any): Promise<any> {
    return await this.model.aggregate(params);
  }

  async groupBy(params: any): Promise<any> {
    return await this.model.groupBy(params);
  }

  async bulkUpsert(
    records: Array<{ where: any; create: any; update: any }>,
  ): Promise<T[]> {
    if (!records || records.length === 0) {
      throw new BadRequestException('Records are required for bulkUpsert');
    }

    return await this.model.transaction(async (tx) => {
      const results = await Promise.all(
        records.map((record) => tx[this.model.name].upsert(record)),
      );

      return results;
    });
  }

  async findWithRelations(id: string, include: any): Promise<T | null> {
    if (!id) {
      throw new BadRequestException('Id is required ');
    }
    return await this.model.findUnique({
      where: { id },
      include,
    });
  }

  // Raw query support
  async executeRaw(query: string, params?: any[]): Promise<any> {
    const prisma = this.model._client as PrismaService;
    return await prisma.$executeRawUnsafe(query, ...(params || []));
  }

  async queryRaw<R = any>(query: string, params?: any[]): Promise<R[]> {
    const prisma = this.model._client as PrismaService;
    return await prisma.$queryRawUnsafe(query, ...(params || []));
  }
}
