import { Module } from '@nestjs/common';

import { PrismaModule } from '../../core/database/prisma.module';
import { BetterAuthService } from '../auth/better-auth.service';
import { SessionModule } from '../session/session.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserResolver, UserService, BetterAuthService],
  exports: [UserResolver, UserService, BetterAuthService],
  imports: [PrismaModule, SessionModule],
})
export class UserModule {}
