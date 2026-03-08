import { Module } from '@nestjs/common';

import { BetterAuthService } from '../auth/better-auth.service';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';

import { SocialController } from './social.controller';

@Module({
  // ⚠️ Removed GithubAuthController - Better Auth handles /api/auth/callback/* automatically
  controllers: [SocialController],
  imports: [UserModule, SessionModule],
  providers: [BetterAuthService],
})
export class CallbackModule {}
