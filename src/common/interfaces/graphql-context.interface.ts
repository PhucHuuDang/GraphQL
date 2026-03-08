import { GqlExecutionContext } from '@nestjs/graphql';

import type { IncomingMessage, ServerResponse } from 'http';

export interface GraphQLContext {
  req: IncomingMessage & {
    headers: Record<string, string | string[] | undefined>;
    ip: string;
  };

  res: ServerResponse;
}
