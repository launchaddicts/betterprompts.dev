declare module 'connect-pg-simple' {
  import session from 'express-session';
  import { Pool } from 'pg';

  export interface PgSessionOptions {
    pool: Pool;
    createTableIfMissing?: boolean;
    tableName?: string;
    schemaName?: string;
    ttl?: number;
    disableTouch?: boolean;
    pruneSessionInterval?: boolean | number;
    errorLog?: (error: Error) => void;
  }

  export default function connectPgSimple(
    session: typeof import('express-session')
  ): new (options: PgSessionOptions) => session.Store;
}