import { Module } from '@nestjs/common';

import { BetterAuthService } from '../../modules/auth/better-auth.service';
import { SessionModule } from '../../modules/session/session.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
// import { GithubAuthController } from './github-auth.controller';

@Module({
  providers: [UserResolver, UserService, BetterAuthService],
  exports: [UserResolver, UserService, BetterAuthService],
  imports: [PrismaModule, SessionModule],
  // If you need custom callback logic, register the controller here:
  // controllers: [GithubAuthController],
})
export class UserModule {}
