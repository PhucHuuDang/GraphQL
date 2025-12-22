import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { SocialController } from '../social/social.controller';
import { UserModule } from '../user/user.module';
import { BetterAuthService } from 'src/auth/better-auth.service';

@Module({
  // ⚠️ Removed GithubAuthController - Better Auth handles /api/auth/callback/* automatically
  controllers: [SocialController],
  imports: [UserModule, SessionModule, BetterAuthService],
})
export class CallbackModule {}
