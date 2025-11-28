import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

export { schema };

export function createDbD1(db: D1Database): DrizzleD1Database<typeof schema> {
    return drizzle(db, { schema });
}

export type Database = DrizzleD1Database<typeof schema>;

