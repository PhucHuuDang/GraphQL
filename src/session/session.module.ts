import { Module } from '@nestjs/common';
import { SessionResolver } from './session.resolver';
import { SessionRepository } from './session.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [SessionResolver, SessionRepository],

  exports: [SessionRepository],
})
export class SessionModule {}
