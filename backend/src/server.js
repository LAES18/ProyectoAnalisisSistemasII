import { app } from './app.js';
import { env } from './config/env.js';
import { db, migrateDatabase } from './database/connection.js';
import { seedDemoData } from './database/seed.js';

async function start() {
  try {
    console.log('Verificando conexión y migraciones...');
    const migrations = await migrateDatabase();
    if (migrations.length) console.log(`Migraciones aplicadas: ${migrations.join(', ')}`);
    if (env.seedDemo) {
      const seeded = await seedDemoData();
      if (seeded) console.log('Datos de demostración creados.');
    }
    const server = app.listen(env.port, () => console.log(`API lista en http://localhost:${env.port}`));
    const shutdown = (signal) => {
      console.log(`\n${signal}: cerrando servidor...`);
      server.close(async () => { await db.destroy(); process.exit(0); });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('No fue posible iniciar la API:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

start();
