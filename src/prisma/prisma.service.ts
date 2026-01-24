import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    // Skip connection in test environment when using shared instance
    if (process.env.NODE_ENV === 'test' && process.env.SKIP_PRISMA_CONNECT === 'true') {
      return;
    }
    if (!this.isConnected) {
      await this.$connect();
      this.isConnected = true;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.isConnected = false;
    }
  }
}
