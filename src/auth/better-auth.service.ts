import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_INSTANCE_KEY } from 'src/constants/auth.constants';
import type { Auth } from 'better-auth';

@Injectable()
export class BetterAuthService {
  constructor(@Inject(AUTH_INSTANCE_KEY) private readonly auth: Auth) {}

  get api() {
    return this.auth.api;
  }
}
