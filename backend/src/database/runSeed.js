import { db } from './connection.js';
import { seedDemoData } from './seed.js';

try {
  const created = await seedDemoData();
  console.log(created ? 'Datos de demostración creados.' : 'No se modificaron datos: ya existen usuarios.');
} finally {
  await db.destroy();
}

