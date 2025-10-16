import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseService<T extends { id: number }> {}
