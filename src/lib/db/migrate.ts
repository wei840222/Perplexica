import db from './';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import path from 'path';

migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
