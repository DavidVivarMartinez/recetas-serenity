import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errores.js';
import { validar } from '../middleware/validar.js';
import { requerirAuth, authOpcional } from '../middleware/auth.js';
import {
  DIFICULTADES,
  includeResumen,
  includeDetalle,
  formatearResumen,
  formatearDetalle,
  parseEtiquetas,
  recalcularValoracion,
} from '../utils/receta.js';
import { normalizarVideo } from '../utils/video.js';

const router = Router();

// ---------- Esquemas ----------
const esquemaId = z.object({ id: z.coerce.number().int().positive() });

const urlOpcional = z
  .union([z.string().trim().url('URL no válida').max(500), z.literal('')])
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

const numeroOpcional = (max) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.coerce.number().min(0).max(max).nullable(),
  );

const enteroOpcional = (max) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.coerce.number().int().min(0).max(max).nullable(),
  );

const textoOpcional = (max) =>
  z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().trim().max(max).nullable(),
  );

// Acepta "facil", "FÁCIL", "Dificil"... y lo convierte al valor canónico
const sinAcentos = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const normalizarDificultad = (v) => {
  if (typeof v !== 'string') return v;
  const clave = sinAcentos(v);
  return DIFICULTADES.find((d) => sinAcentos(d) === clave) ?? v;
};
const esquemaDificultad = z.preprocess(
  normalizarDificultad,
  z.enum(DIFICULTADES, { message: 'Dificultad no válida (Fácil, Medio o Difícil)' }),
);

const esquemaIngrediente = z.object({
  nombre: z.string().trim().min(1, 'El ingrediente necesita un nombre').max(100),
  cantidad: numeroOpcional(100000),
  unidad: textoOpcional(30),
  nota: textoOpcional(200),
  alimentoId: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.coerce.number().int().positive().nullable(),
  ),
});

const esquemaPaso = z.object({
  titulo: textoOpcional(120),
  descripcion: z.string().trim().min(1, 'El paso necesita una descripción').max(2000),
  tiempoMin: enteroOpcional(1440),
  consejo: textoOpcional(500),
});

const esquemaReceta = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(120),
  descripcion: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000),
  imagenUrl: urlOpcional,
  videoUrl: urlOpcional,
  tiempoTotal: z.coerce.number().int().positive('El tiempo total debe ser mayor que 0').max(1440),
  tiempoPreparacion: enteroOpcional(1440),
  tiempoCoccion: enteroOpcional(1440),
  dificultad: esquemaDificultad,
  categoria: z.string().trim().min(2).max(50),
  porciones: z.coerce.number().int().min(1).max(50).default(4),
  etiquetas: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  calorias: enteroOpcional(10000),
  proteinas: numeroOpcional(1000),
  carbohidratos: numeroOpcional(1000),
  grasas: numeroOpcional(1000),
  fibra: numeroOpcional(1000),
  azucares: numeroOpcional(1000),
  sodio: numeroOpcional(100000),
  publicada: z.boolean().default(true),
  ingredientes: z.array(esquemaIngrediente).min(1, 'Añade al menos un ingrediente').max(60),
  pasos: z.array(esquemaPaso).min(1, 'Añade al menos un paso').max(40),
});

const esquemaListado = z.object({
  q: z.string().trim().max(100).optional(),
  categoria: z.string().trim().max(50).optional(),
  dificultad: z.preprocess(normalizarDificultad, z.enum(DIFICULTADES).optional()),
  etiqueta: z.string().trim().max(30).optional(),
  autorId: z.coerce.number().int().positive().optional(),
  tiempoHasta: z.coerce.number().int().positive().optional(),
  tiempoMasDe: z.coerce.number().int().min(0).optional(),
  orden: z.enum(['recientes', 'valoracion', 'tiempo', 'populares']).default('recientes'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const esquemaValoracion = z.object({
  puntuacion: z.coerce.number().int().min(1).max(5),
  comentario: textoOpcional(1000),
});

// ---------- Helpers ----------
function construirWhere(f) {
  const where = { publicada: true };
  if (f.q) {
    where.OR = [
      { titulo: { contains: f.q } },
      { descripcion: { contains: f.q } },
      { etiquetas: { contains: f.q } },
      { categoria: { contains: f.q } },
      { ingredientes: { some: { nombre: { contains: f.q } } } },
    ];
  }
  if (f.categoria && f.categoria !== 'all') where.categoria = f.categoria;
  if (f.dificultad) where.dificultad = f.dificultad;
  if (f.etiqueta) where.etiquetas = { contains: `"${f.etiqueta}"` };
  if (f.autorId) where.autorId = f.autorId;
  if (f.tiempoHasta != null || f.tiempoMasDe != null) {
    where.tiempoTotal = {
      ...(f.tiempoMasDe != null ? { gt: f.tiempoMasDe } : {}),
      ...(f.tiempoHasta != null ? { lte: f.tiempoHasta } : {}),
    };
  }
  return where;
}

const ORDENES = {
  recientes: [{ creadoEn: 'desc' }],
  valoracion: [{ valoracionMedia: 'desc' }, { numValoraciones: 'desc' }, { creadoEn: 'desc' }],
  tiempo: [{ tiempoTotal: 'asc' }],
  populares: [{ favoritos: { _count: 'desc' } }, { valoracionMedia: 'desc' }],
};

async function comprobarAlimentos(ingredientes) {
  const ids = [...new Set(ingredientes.map((i) => i.alimentoId).filter(Boolean))];
  if (!ids.length) return;
  const existentes = await prisma.alimento.findMany({ where: { id: { in: ids } }, select: { id: true } });
  const faltan = ids.filter((id) => !existentes.some((e) => e.id === id));
  if (faltan.length) throw new HttpError(400, `Alimentos inexistentes: ${faltan.join(', ')}`);
}

function datosReceta(d) {
  if (d.videoUrl && !normalizarVideo(d.videoUrl)) {
    throw new HttpError(400, 'El enlace del vídeo no es una URL válida');
  }
  return {
    titulo: d.titulo,
    descripcion: d.descripcion,
    imagenUrl: d.imagenUrl,
    videoUrl: d.videoUrl,
    tiempoTotal: d.tiempoTotal,
    tiempoPreparacion: d.tiempoPreparacion,
    tiempoCoccion: d.tiempoCoccion,
    dificultad: d.dificultad,
    categoria: d.categoria,
    porciones: d.porciones,
    etiquetas: JSON.stringify([...new Set(d.etiquetas)]),
    calorias: d.calorias,
    proteinas: d.proteinas,
    carbohidratos: d.carbohidratos,
    grasas: d.grasas,
    fibra: d.fibra,
    azucares: d.azucares,
    sodio: d.sodio,
    publicada: d.publicada,
  };
}

const crearIngredientes = (ingredientes) =>
  ingredientes.map((i, idx) => ({
    nombre: i.nombre,
    cantidad: i.cantidad,
    unidad: i.unidad,
    nota: i.nota,
    alimentoId: i.alimentoId,
    orden: idx + 1,
  }));

const crearPasos = (pasos) =>
  pasos.map((p, idx) => ({
    orden: idx + 1,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tiempoMin: p.tiempoMin,
    consejo: p.consejo,
  }));

async function obtenerDetalle(id, usuario) {
  const receta = await prisma.receta.findUnique({ where: { id }, include: includeDetalle(usuario?.id) });
  if (!receta) throw new HttpError(404, 'Receta no encontrada');
  return formatearDetalle(receta, usuario);
}

async function recetaEditable(id, usuario) {
  const receta = await prisma.receta.findUnique({ where: { id }, select: { id: true, autorId: true } });
  if (!receta) throw new HttpError(404, 'Receta no encontrada');
  if (receta.autorId !== usuario.id && usuario.rol !== 'admin') {
    throw new HttpError(403, 'Solo el autor o un administrador pueden modificar esta receta');
  }
  return receta;
}

// ---------- Rutas de colección (antes de /:id) ----------

// GET /api/recetas/categorias
router.get('/categorias', async (req, res) => {
  const grupos = await prisma.receta.groupBy({
    by: ['categoria'],
    where: { publicada: true },
    _count: { _all: true },
    orderBy: { categoria: 'asc' },
  });
  res.json(grupos.map((g) => ({ nombre: g.categoria, total: g._count._all })));
});

// GET /api/recetas/etiquetas
router.get('/etiquetas', async (req, res) => {
  const filas = await prisma.receta.findMany({ where: { publicada: true }, select: { etiquetas: true } });
  const conteo = new Map();
  for (const f of filas) {
    for (const e of parseEtiquetas(f.etiquetas)) conteo.set(e, (conteo.get(e) ?? 0) + 1);
  }
  res.json(
    [...conteo.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre)),
  );
});

// GET /api/recetas/dificultades
router.get('/dificultades', (req, res) => res.json(DIFICULTADES));

// GET /api/recetas/mias  (incluye borradores)
router.get('/mias', requerirAuth, async (req, res) => {
  const recetas = await prisma.receta.findMany({
    where: { autorId: req.usuario.id },
    orderBy: { actualizadoEn: 'desc' },
    include: includeResumen(req.usuario.id),
  });
  res.json(recetas.map(formatearResumen));
});

// GET /api/recetas/favoritas
router.get('/favoritas', requerirAuth, async (req, res) => {
  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: req.usuario.id },
    orderBy: { creadoEn: 'desc' },
    include: { receta: { include: includeResumen(req.usuario.id) } },
  });
  res.json(favoritos.filter((f) => f.receta.publicada).map((f) => formatearResumen(f.receta)));
});

// GET /api/recetas
router.get('/', authOpcional, validar(esquemaListado, 'query'), async (req, res) => {
  const f = req.datos.query;
  const where = construirWhere(f);

  const [total, recetas] = await Promise.all([
    prisma.receta.count({ where }),
    prisma.receta.findMany({
      where,
      orderBy: ORDENES[f.orden],
      skip: (f.page - 1) * f.limit,
      take: f.limit,
      include: includeResumen(req.usuario?.id),
    }),
  ]);

  res.json({
    datos: recetas.map(formatearResumen),
    total,
    page: f.page,
    limit: f.limit,
    totalPaginas: Math.max(1, Math.ceil(total / f.limit)),
  });
});

// POST /api/recetas
router.post('/', requerirAuth, validar(esquemaReceta), async (req, res) => {
  const d = req.datos.body;
  await comprobarAlimentos(d.ingredientes);

  const creada = await prisma.receta.create({
    data: {
      ...datosReceta(d),
      autorId: req.usuario.id,
      ingredientes: { create: crearIngredientes(d.ingredientes) },
      pasos: { create: crearPasos(d.pasos) },
    },
    select: { id: true },
  });

  res.status(201).json(await obtenerDetalle(creada.id, req.usuario));
});

// ---------- Rutas por id ----------

// GET /api/recetas/:id
router.get('/:id', authOpcional, validar(esquemaId, 'params'), async (req, res) => {
  const detalle = await obtenerDetalle(req.datos.params.id, req.usuario);
  if (!detalle.publicada && !detalle.puedeEditar) throw new HttpError(404, 'Receta no encontrada');
  res.json(detalle);
});

// PUT /api/recetas/:id
router.put('/:id', requerirAuth, validar(esquemaId, 'params'), validar(esquemaReceta), async (req, res) => {
  const { id } = req.datos.params;
  const d = req.datos.body;
  await recetaEditable(id, req.usuario);
  await comprobarAlimentos(d.ingredientes);

  await prisma.$transaction([
    prisma.recetaIngrediente.deleteMany({ where: { recetaId: id } }),
    prisma.paso.deleteMany({ where: { recetaId: id } }),
    prisma.receta.update({
      where: { id },
      data: {
        ...datosReceta(d),
        ingredientes: { create: crearIngredientes(d.ingredientes) },
        pasos: { create: crearPasos(d.pasos) },
      },
    }),
  ]);

  res.json(await obtenerDetalle(id, req.usuario));
});

// DELETE /api/recetas/:id
router.delete('/:id', requerirAuth, validar(esquemaId, 'params'), async (req, res) => {
  const { id } = req.datos.params;
  await recetaEditable(id, req.usuario);
  await prisma.receta.delete({ where: { id } });
  res.status(204).end();
});

// POST /api/recetas/:id/favorito  -> alterna favorito
router.post('/:id/favorito', requerirAuth, validar(esquemaId, 'params'), async (req, res) => {
  const recetaId = req.datos.params.id;
  const usuarioId = req.usuario.id;

  const receta = await prisma.receta.findUnique({ where: { id: recetaId }, select: { id: true } });
  if (!receta) throw new HttpError(404, 'Receta no encontrada');

  const clave = { usuarioId_recetaId: { usuarioId, recetaId } };
  const existente = await prisma.favorito.findUnique({ where: clave });
  if (existente) {
    await prisma.favorito.delete({ where: clave });
  } else {
    await prisma.favorito.create({ data: { usuarioId, recetaId } });
  }
  const numFavoritos = await prisma.favorito.count({ where: { recetaId } });
  res.json({ esFavorita: !existente, numFavoritos });
});

// PUT /api/recetas/:id/valoracion  -> crea o actualiza la valoración del usuario
router.put('/:id/valoracion', requerirAuth, validar(esquemaId, 'params'), validar(esquemaValoracion), async (req, res) => {
  const recetaId = req.datos.params.id;
  const usuarioId = req.usuario.id;
  const { puntuacion, comentario } = req.datos.body;

  const receta = await prisma.receta.findUnique({ where: { id: recetaId }, select: { autorId: true } });
  if (!receta) throw new HttpError(404, 'Receta no encontrada');
  if (receta.autorId === usuarioId) throw new HttpError(403, 'No puedes valorar tu propia receta');

  const valoracion = await prisma.valoracion.upsert({
    where: { usuarioId_recetaId: { usuarioId, recetaId } },
    create: { usuarioId, recetaId, puntuacion, comentario },
    update: { puntuacion, comentario },
    include: { usuario: { select: { id: true, nombre: true, avatarUrl: true } } },
  });
  const resumen = await recalcularValoracion(prisma, recetaId);

  res.json({
    valoracion: {
      id: valoracion.id,
      puntuacion: valoracion.puntuacion,
      comentario: valoracion.comentario,
      creadoEn: valoracion.creadoEn,
      usuario: valoracion.usuario,
    },
    ...resumen,
  });
});

// DELETE /api/recetas/:id/valoracion
router.delete('/:id/valoracion', requerirAuth, validar(esquemaId, 'params'), async (req, res) => {
  const recetaId = req.datos.params.id;
  const usuarioId = req.usuario.id;
  await prisma.valoracion.deleteMany({ where: { usuarioId, recetaId } });
  res.json(await recalcularValoracion(prisma, recetaId));
});

export default router;
