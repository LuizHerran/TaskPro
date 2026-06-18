// TODO: configurar a conexão com o banco SQLite
// Dependência necessária: npm install better-sqlite3 @types/better-sqlite3

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const sqlite = new Database(path.join(__dirname, '..', 'taskpro.db'));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
