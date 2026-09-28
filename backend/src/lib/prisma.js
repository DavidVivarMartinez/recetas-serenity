import { PrismaClient } from '@prisma/client';

// El esquema declara directUrl = env("DIRECT_URL"); si no está definida, se
// deriva de DATABASE_URL (en Neon es la misma cadena sin "-pooler").
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL.replace('-pooler', '');
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
