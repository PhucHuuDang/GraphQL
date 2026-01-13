import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_INSTANCE_KEY } from '../../constants/auth.constants';
// import type { Auth } from 'better-auth';

//@ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Auth } = require('better-auth');

@Injectable()
export class BetterAuthService {
  constructor(@Inject(AUTH_INSTANCE_KEY) private readonly auth: typeof Auth) {}

  get api() {
    return this.auth.api;
  }
}
