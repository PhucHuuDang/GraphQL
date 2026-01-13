import { Module } from '@nestjs/common';
import { SessionModule } from '../modules/session/session.module';
import { SocialController } from '../social/social.controller';
import { BetterAuthService } from '../modules/auth/better-auth.service';
import { UserModule } from '../modules/user/user.module';

@Module({
  // ⚠️ Removed GithubAuthController - Better Auth handles /api/auth/callback/* automatically
  controllers: [SocialController],
  imports: [UserModule, SessionModule],
  providers: [BetterAuthService],
})
export class CallbackModule {}
