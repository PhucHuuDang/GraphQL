import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module.js';
import { SocialController } from '../social/social.controller.js';
import { GithubAuthController } from '../user/github-auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { UserService } from '../user/user.service.js';

@Module({
  controllers: [GithubAuthController, SocialController],
  providers: [UserService],
  imports: [UserModule, SessionModule],
})
export class CallbackModule {}
