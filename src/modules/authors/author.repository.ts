import { Injectable } from '@nestjs/common';
import { Author, Prisma } from '../../../generated/prisma';
import { BaseRepository } from '../../common/base.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthorRepository extends BaseRepository<
  Author,
  Prisma.AuthorDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.author, 'AuthorRepository');
  }
}
