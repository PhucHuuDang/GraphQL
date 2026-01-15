import { Global, Module } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';

@Global()
@Module({
  providers: [
    {
      provide: AUTH_INSTANCE_KEY,
      useFactory: async () => {
        const { auth } = await import('../../lib/auth.js');
        return auth;
      },
    },
    BetterAuthService,
  ],
  exports: [AUTH_INSTANCE_KEY, BetterAuthService],
})
export class AuthModule {}
