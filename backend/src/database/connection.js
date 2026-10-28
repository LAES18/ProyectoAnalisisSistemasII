import knex from 'knex';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const connection = env.mysqlUrl
  ? (() => {
      const url = new URL(env.mysqlUrl);
      return {
        host: url.hostname,
        port: Number(url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: decodeURIComponent(url.pathname.replace(/^\//, '')),
        ssl: env.db.ssl ? { rejectUnauthorized: env.db.sslRejectUnauthorized } : undefined
      };
    })()
  : {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      ssl: env.db.ssl ? { rejectUnauthorized: env.db.sslRejectUnauthorized } : undefined
    };

export const db = knex({
  client: 'mysql2',
  connection,
  pool: { min: 0, max: 10 },
  migrations: {
    directory: fileURLToPath(new URL('./migrations', import.meta.url)),
    tableName: 'knex_migrations'
  }
});

export async function migrateDatabase() {
  const [, migrations] = await db.migrate.latest();
  return migrations;
}

