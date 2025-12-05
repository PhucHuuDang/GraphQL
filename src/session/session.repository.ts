import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/index.js';
import { BaseRepository } from '../common/base.repository.js';
import { SessionModel } from '../models/session.model.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionRepository extends BaseRepository<
  SessionModel,
  Prisma.SessionDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.session, 'SessionRepository');
  }
}
