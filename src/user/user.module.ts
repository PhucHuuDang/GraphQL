import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
// import { GithubAuthController } from './github-auth.controller';

@Module({
  providers: [UserResolver, UserService, UserRepository],
  exports: [UserResolver, UserService, UserRepository],
  imports: [PrismaModule],
  // If you need custom callback logic, register the controller here:
  // controllers: [GithubAuthController],
})
export class UserModule {}
