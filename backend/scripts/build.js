// Build de producción: genera el cliente de Prisma y aplica las migraciones.
// Si no existe DIRECT_URL (conexión directa para migraciones), la deriva de
// DATABASE_URL quitando "-pooler" del host, que es como funciona Neon.
import { spawnSync } from 'node:child_process';

const env = { ...process.env };
if (!env.DIRECT_URL && env.DATABASE_URL) {
  env.DIRECT_URL = env.DATABASE_URL.replace('-pooler', '');
  console.log('DIRECT_URL no definida: se deriva de DATABASE_URL (sin -pooler).');
}
if (!env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Configúrala en las variables de entorno.');
  process.exit(1);
}

for (const args of [['prisma', 'generate'], ['prisma', 'migrate', 'deploy']]) {
  console.log(`\n> npx ${args.join(' ')}`);
  const r = spawnSync('npx', args, { stdio: 'inherit', env, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
