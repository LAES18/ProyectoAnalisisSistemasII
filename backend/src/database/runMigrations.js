import { db, migrateDatabase } from './connection.js';

try {
  const migrations = await migrateDatabase();
  console.log(migrations.length ? `Migraciones aplicadas: ${migrations.join(', ')}` : 'La base de datos está actualizada.');
} finally {
  await db.destroy();
}

