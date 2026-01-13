// src/modules/auth/better-auth.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';

@Injectable()
export class BetterAuthService {
  constructor(@Inject(AUTH_INSTANCE_KEY) private readonly authInstance: any) {}

  get api() {
    return this.authInstance.api;
  }

  // Nếu cần truy cập toàn bộ auth instance
  get auth() {
    return this.authInstance;
  }
}
