import { Module } from '@nestjs/common';
import { SocialController } from 'src/social/social.controller';
import { GithubAuthController } from 'src/user/github-auth.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [GithubAuthController, SocialController],
  providers: [UserService],
  imports: [UserModule],
})
export class CallbackModule {}
