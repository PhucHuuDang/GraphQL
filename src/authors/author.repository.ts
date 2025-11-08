import { Injectable } from '@nestjs/common';
import { Author, Prisma } from 'generated/prisma';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorRepository extends BaseRepository<
  Author,
  Prisma.AuthorDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.author, 'AuthorRepository');
  }
}
