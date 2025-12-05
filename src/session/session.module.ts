import { Module } from '@nestjs/common';
import { SessionResolver } from './session.resolver.js';
import { SessionRepository } from './session.repository.js';

@Module({
  providers: [SessionResolver, SessionRepository],

  exports: [SessionRepository],
})
export class SessionModule {}
