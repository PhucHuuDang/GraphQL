import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { BaseRepository } from 'src/common/base.repository';
import { SessionModel } from 'src/models/session.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionRepository extends BaseRepository<
  SessionModel,
  Prisma.SessionDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.session, 'SessionRepository');
  }
}
