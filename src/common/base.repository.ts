import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export abstract class BaseRepository<T> {
  constructor(protected readonly model: any) {}

  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  async findById(id: number): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findFirstWithConditions(
    condition: Prisma.PostWhereInput,
  ): Promise<T | null> {
    return await this.model.findFirst({ where: condition });
  }

  async create(data: any, include?: any): Promise<T> {
    return await this.model.create({ data, include });
  }

  async createManyAndReturn(data: any[]): Promise<T[]> {
    return await this.model.createManyAndReturn({ data });
  }

  async createMany(data: any[]): Promise<number> {
    return await this.model.createMany({ data });
  }

  async update(id: number, data: any): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<T> {
    return await this.model.delete({ where: { id } });
  }
}
