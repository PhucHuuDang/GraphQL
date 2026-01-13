import { Global, Module } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { auth } from '../../lib/auth';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';

@Global()
@Module({
  providers: [
    {
      provide: AUTH_INSTANCE_KEY,
      useFactory: async () => {
        const { betterAuth } = await import('better-auth');

        // return betterAuth({
        //   secret: process.env.AUTH_SECRET!,
        // });

        return auth;
      },
    },
    BetterAuthService,
  ],
  exports: [AUTH_INSTANCE_KEY, BetterAuthService],
})
export class AuthModule {}
