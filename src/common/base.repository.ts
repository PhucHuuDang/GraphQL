import { PrismaService } from 'src/prisma/prisma.service';

export abstract class BaseRepository<T> {
  protected abstract model: any;

  constructor(protected readonly prisma: PrismaService) {}

  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  async findById(id: number): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async create(data: any): Promise<T> {
    return await this.model.create({ data });
  }

  async update(id: number, data: any): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<T> {
    return await this.model.delete({ where: { id } });
  }
}
