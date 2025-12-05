import { Injectable } from '@nestjs/common';
import { Prisma, User } from '../../generated/prisma/index';
import { BaseRepository } from '../common/base.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma.user, 'UserRepository');
  }
}
