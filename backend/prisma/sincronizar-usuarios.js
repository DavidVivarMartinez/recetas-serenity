// Crea en la base de datos las cuentas de datos/usuarios.js que aún no existan.
// No borra ni modifica nada: las cuentas existentes se dejan como están
// (ni nombre, ni rol, ni contraseña). Seguro para ejecutar en producción.
// Ejecutar: npm run db:usuarios
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { USUARIOS } from './datos/usuarios.js';

const prisma = new PrismaClient();

async function main() {
  let passwordGenerada = null;
  const creadas = [];
  const existentes = [];

  for (const u of USUARIOS) {
    const email = u.email.toLowerCase();
    const existe = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
    if (existe) {
      existentes.push(email);
      continue;
    }
    let password = u.password;
    if (!password) {
      passwordGenerada ??= randomBytes(9).toString('base64url');
      password = passwordGenerada;
    }
    await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        email,
        rol: u.rol ?? 'usuario',
        bio: u.bio ?? null,
        avatarUrl: u.avatarUrl ?? null,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    creadas.push(email);
  }

  console.log(`Cuentas ya existentes (sin cambios): ${existentes.length}`);
  console.log(`Cuentas creadas: ${creadas.length}${creadas.length ? ' -> ' + creadas.join(', ') : ''}`);
  if (passwordGenerada) {
    console.log(`\nSEED_PASSWORD no estaba definida. Contraseña inicial de las cuentas nuevas: ${passwordGenerada}`);
    console.log('Guárdala: no se volverá a mostrar.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
