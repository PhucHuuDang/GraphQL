import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../generated/prisma';
import { SessionModel } from '../../common/models/session.model';
import { BaseRepository } from '../../core/database/base.repository';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class SessionService extends BaseRepository<SessionModel, Prisma.SessionDelegate> {
  constructor(prisma: PrismaService) {
    super(prisma, 'session', 'SessionService');
  }
}
