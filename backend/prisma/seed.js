// Semilla de datos.
// Ejecutar: npm run db:seed   (borra y vuelve a crear usuarios, alimentos y recetas)
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { USUARIOS, AUTOR_POR_DEFECTO } from './datos/usuarios.js';
import { ALIMENTOS } from './datos/alimentos.js';
import { RECETAS } from './datos/recetas.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando tablas...');
  await prisma.valoracion.deleteMany();
  await prisma.favorito.deleteMany();
  await prisma.paso.deleteMany();
  await prisma.recetaIngrediente.deleteMany();
  await prisma.receta.deleteMany();
  await prisma.alimento.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Creando usuarios...');
  // Contraseña para las cuentas que no tengan una definida (SEED_PASSWORD ausente)
  let passwordGenerada = null;
  const usuarios = {};
  const hashes = new Map();
  for (const u of USUARIOS) {
    if (!u.password) {
      passwordGenerada ??= randomBytes(9).toString('base64url');
      u.password = passwordGenerada;
    }
    if (!hashes.has(u.password)) hashes.set(u.password, await bcrypt.hash(u.password, 10));
    usuarios[u.clave] = await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        email: u.email.toLowerCase(),
        rol: u.rol,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        passwordHash: hashes.get(u.password),
      },
    });
  }

  console.log('Creando alimentos...');
  await prisma.alimento.createMany({ data: ALIMENTOS });
  const alimentos = Object.fromEntries((await prisma.alimento.findMany()).map((a) => [a.nombre, a]));

  console.log('Creando recetas...');
  let avisos = 0;
  let totalValoraciones = 0;

  for (const r of RECETAS) {
    for (const i of r.ingredientes) {
      if (i.alimento && !alimentos[i.alimento]) {
        console.warn(`  Aviso: el alimento "${i.alimento}" (receta ${r.id}) no existe en la tabla`);
        avisos++;
      }
    }

    const autor = usuarios[r.autor] ?? usuarios[AUTOR_POR_DEFECTO];

    const receta = await prisma.receta.create({
      data: {
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        imagenUrl: r.imagenUrl,
        videoUrl: r.videoUrl ?? null,
        tiempoTotal: r.tiempoTotal,
        tiempoPreparacion: r.tiempoPreparacion ?? null,
        tiempoCoccion: r.tiempoCoccion ?? null,
        dificultad: r.dificultad,
        categoria: r.categoria,
        porciones: r.porciones,
        etiquetas: JSON.stringify(r.etiquetas),
        ...r.nutricion,
        autorId: autor.id,
        ingredientes: {
          create: r.ingredientes.map((i, idx) => ({
            nombre: i.nombre,
            cantidad: i.cantidad ?? null,
            unidad: i.unidad ?? null,
            nota: i.nota ?? null,
            orden: idx + 1,
            alimentoId: i.alimento ? alimentos[i.alimento]?.id ?? null : null,
          })),
        },
        pasos: {
          create: r.pasos.map((p, idx) => ({
            orden: idx + 1,
            titulo: p.titulo ?? null,
            descripcion: p.descripcion,
            tiempoMin: p.tiempoMin ?? null,
            consejo: p.consejo ?? null,
          })),
        },
      },
    });

    // Solo se crean las valoraciones cuyo usuario exista y no sea el autor
    const valoraciones = (r.valoraciones ?? []).filter(
      (v) => usuarios[v.usuario] && usuarios[v.usuario].id !== autor.id,
    );
    for (const v of valoraciones) {
      await prisma.valoracion.create({
        data: {
          recetaId: receta.id,
          usuarioId: usuarios[v.usuario].id,
          puntuacion: v.puntuacion,
          comentario: v.comentario ?? null,
        },
      });
      totalValoraciones++;
    }
    if (valoraciones.length) {
      const agg = await prisma.valoracion.aggregate({
        where: { recetaId: receta.id },
        _avg: { puntuacion: true },
        _count: true,
      });
      await prisma.receta.update({
        where: { id: receta.id },
        data: {
          valoracionMedia: Math.round((agg._avg.puntuacion ?? 0) * 10) / 10,
          numValoraciones: agg._count,
        },
      });
    }
  }

  // Las recetas se insertan con id fijo; en PostgreSQL eso no avanza la secuencia
  // del autoincremento, así que se reajusta para que las siguientes no choquen.
  for (const tabla of ['Receta', 'Usuario', 'Alimento', 'Paso', 'RecetaIngrediente', 'Valoracion']) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tabla}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabla}"), 0) + 1, false)`,
    );
  }

  console.log('\nResumen de la semilla:');
  console.log(`  Usuarios:     ${Object.keys(usuarios).length}`);
  console.log(`  Alimentos:    ${Object.keys(alimentos).length}`);
  console.log(`  Recetas:      ${RECETAS.length}`);
  console.log(`  Valoraciones: ${totalValoraciones}`);
  if (avisos) console.log(`  Avisos:       ${avisos} ingredientes sin alimento enlazado`);
  if (passwordGenerada) {
    console.log(`\nSEED_PASSWORD no estaba definida. Contraseña inicial generada para las cuentas: ${passwordGenerada}`);
    console.log('Guárdala: no se volverá a mostrar.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
