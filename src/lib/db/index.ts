import { drizzle } from 'drizzle-orm/bun-sqlite';
import Database from 'bun:sqlite';
import * as schema from './schema';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || process.cwd();
const sqlite = new Database(path.join(DATA_DIR, './data/db.sqlite'));
const db = drizzle(sqlite, { schema: schema });

export default db;
