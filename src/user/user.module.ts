import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserResolver } from './user.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UserRepository } from './user.repository.js';
import { SessionModule } from '../session/session.module.js';
import { SessionRepository } from '../session/session.repository.js';
// import { GithubAuthController } from './github-auth.controller.js';

@Module({
  providers: [UserResolver, UserService, UserRepository],
  exports: [UserResolver, UserService, UserRepository],
  imports: [PrismaModule, SessionModule],
  // If you need custom callback logic, register the controller here:
  // controllers: [GithubAuthController],
})
export class UserModule {}
