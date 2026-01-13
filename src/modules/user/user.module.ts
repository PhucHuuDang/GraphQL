import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRepository } from './user.repository';
import { SessionModule } from '../../modules/session/session.module';
import { SessionRepository } from '../../modules/session/session.repository';
import { BetterAuthService } from '../../modules/auth/better-auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
// import { GithubAuthController } from './github-auth.controller';

@Module({
  providers: [UserResolver, UserService, UserRepository, BetterAuthService],
  exports: [UserResolver, UserService, UserRepository, BetterAuthService],
  imports: [PrismaModule, SessionModule],
  // If you need custom callback logic, register the controller here:
  // controllers: [GithubAuthController],
})
export class UserModule {}
