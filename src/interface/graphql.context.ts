import type { IncomingMessage, ServerResponse } from 'http';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface GraphQLContext {
  req: IncomingMessage & {
    headers: Record<string, string | string[] | undefined>;
    ip: string;
  };

  res: ServerResponse;
}
