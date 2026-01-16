import { Module } from '@nestjs/common';

import { BetterAuthService } from '../modules/auth/better-auth.service';
import { SessionModule } from '../modules/session/session.module';
import { UserModule } from '../modules/user/user.module';
import { SocialController } from '../social/social.controller';

@Module({
  // ⚠️ Removed GithubAuthController - Better Auth handles /api/auth/callback/* automatically
  controllers: [SocialController],
  imports: [UserModule, SessionModule],
  providers: [BetterAuthService],
})
export class CallbackModule {}
