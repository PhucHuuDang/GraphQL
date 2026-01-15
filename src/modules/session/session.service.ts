import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { BaseRepository } from '../../common/base.repository';
import { SessionModel } from '../../models/session.model';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionService extends BaseRepository<
  SessionModel,
  Prisma.SessionDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.session, 'SessionService');
  }
}
