import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { SocialController } from '../social/social.controller';
import { UserModule } from '../user/user.module';

@Module({
  // ⚠️ Removed GithubAuthController - Better Auth handles /api/auth/callback/* automatically
  controllers: [SocialController],
  imports: [UserModule, SessionModule],
})
export class CallbackModule {}
