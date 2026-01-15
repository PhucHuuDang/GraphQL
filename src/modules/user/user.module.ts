import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { SessionModule } from '../../modules/session/session.module';
import { BetterAuthService } from '../../modules/auth/better-auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
// import { GithubAuthController } from './github-auth.controller';

@Module({
  providers: [UserResolver, UserService, BetterAuthService],
  exports: [UserResolver, UserService, BetterAuthService],
  imports: [PrismaModule, SessionModule],
  // If you need custom callback logic, register the controller here:
  // controllers: [GithubAuthController],
})
export class UserModule {}
