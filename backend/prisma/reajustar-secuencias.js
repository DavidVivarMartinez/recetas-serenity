// Reajusta las secuencias de autoincremento de PostgreSQL para que el siguiente
// id sea MAX(id) + 1. Necesario tras insertar filas con id fijo (la semilla lo
// hace con las recetas). Seguro: no toca datos. Ejecutar: npm run db:secuencias
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TABLAS = ['Receta', 'Usuario', 'Alimento', 'Paso', 'RecetaIngrediente', 'Valoracion'];

try {
  for (const tabla of TABLAS) {
    const [{ setval }] = await prisma.$queryRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tabla}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabla}"), 0) + 1, false) AS setval`,
    );
    console.log(`${tabla}: siguiente id = ${setval}`);
  }
} finally {
  await prisma.$disconnect();
}
