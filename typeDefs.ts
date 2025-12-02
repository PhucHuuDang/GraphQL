import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const typeDefs = readFileSync(
  join(process.cwd(), '../schema.gql'),
  'utf8',
);
