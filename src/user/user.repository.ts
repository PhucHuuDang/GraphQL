import { Injectable } from '@nestjs/common';
import { Prisma, User } from '../../generated/prisma/index.js';
import { BaseRepository } from '../common/base.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma.user, 'UserRepository');
  }
}
