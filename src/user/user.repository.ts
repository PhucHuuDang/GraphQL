import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma.user, 'UserRepository');
  }
}
