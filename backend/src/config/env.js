import 'dotenv/config';

const asBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'desarrollo-local-cambiar-en-produccion-123456',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  mysqlUrl: process.env.MYSQL_URL || process.env.DATABASE_URL || '',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_academico',
    ssl: asBoolean(process.env.DB_SSL),
    sslRejectUnauthorized: asBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true)
  },
  seedDemo: asBoolean(process.env.SEED_DEMO, (process.env.NODE_ENV || 'development') !== 'production')
};

if (env.nodeEnv === 'production' && env.jwtSecret.startsWith('desarrollo-local')) {
  throw new Error('JWT_SECRET debe configurarse con una clave segura en producción.');
}

