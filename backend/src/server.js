import { crearApp } from './app.js';
import { prisma } from './lib/prisma.js';

const PORT = Number(process.env.PORT) || 3001;

const servidor = crearApp().listen(PORT, () => {
  console.log(`API Recetas Serenity escuchando en http://localhost:${PORT}/api`);
});

async function apagar(senal) {
  console.log(`\nRecibido ${senal}, cerrando...`);
  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
