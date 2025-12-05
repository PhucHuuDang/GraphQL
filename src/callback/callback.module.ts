import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { SocialController } from '../social/social.controller';
import { GithubAuthController } from '../user/github-auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  controllers: [GithubAuthController, SocialController],
  providers: [UserService],
  imports: [UserModule, SessionModule],
})
export class CallbackModule {}
