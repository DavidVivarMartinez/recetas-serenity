import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errores.js';
import { validar } from '../middleware/validar.js';
import { requerirAuth, requerirRol } from '../middleware/auth.js';
import { CATEGORIAS_ALIMENTO, formatearAlimento } from '../utils/alimento.js';

const router = Router();

const esquemaId = z.object({ id: z.coerce.number().int().positive() });

const numero = (max = 1000) => z.coerce.number().min(0).max(max);
const numeroOpcional = (max = 1000) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.coerce.number().min(0).max(max).nullable(),
  );

const esquemaAlimento = z.object({
  nombre: z.string().trim().min(2).max(80),
  categoria: z.enum(CATEGORIAS_ALIMENTO, { message: 'Categoría no válida' }),
  unidadBase: z.enum(['g', 'ml']).default('g'),
  calorias: numero(1000),
  proteinas: numero(100),
  carbohidratos: numero(100),
  grasas: numero(100),
  grasasSaturadas: numeroOpcional(100),
  fibra: numeroOpcional(100),
  azucares: numeroOpcional(100),
  sal: numeroOpcional(100),
});

const ORDENES = {
  nombre: { nombre: 'asc' },
  '-nombre': { nombre: 'desc' },
  calorias: { calorias: 'asc' },
  '-calorias': { calorias: 'desc' },
  proteinas: { proteinas: 'asc' },
  '-proteinas': { proteinas: 'desc' },
  carbohidratos: { carbohidratos: 'asc' },
  '-carbohidratos': { carbohidratos: 'desc' },
  grasas: { grasas: 'asc' },
  '-grasas': { grasas: 'desc' },
  fibra: { fibra: 'asc' },
  '-fibra': { fibra: 'desc' },
};

const esquemaListado = z.object({
  q: z.string().trim().max(80).optional(),
  categoria: z.string().trim().max(60).optional(),
  orden: z.enum(Object.keys(ORDENES)).default('nombre'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// GET /api/alimentos/categorias
router.get('/categorias', async (req, res) => {
  const grupos = await prisma.alimento.groupBy({
    by: ['categoria'],
    _count: { _all: true },
  });
  const conteo = Object.fromEntries(grupos.map((g) => [g.categoria, g._count._all]));
  res.json(CATEGORIAS_ALIMENTO.map((nombre) => ({ nombre, total: conteo[nombre] ?? 0 })));
});

// GET /api/alimentos
router.get('/', validar(esquemaListado, 'query'), async (req, res) => {
  const { q, categoria, orden, page, limit } = req.datos.query;
  const where = {};
  if (q) where.nombre = { contains: q, mode: 'insensitive' }; // sin distinguir mayúsculas (PostgreSQL)
  if (categoria && categoria !== 'all') where.categoria = categoria;

  const [total, alimentos] = await Promise.all([
    prisma.alimento.count({ where }),
    prisma.alimento.findMany({
      where,
      orderBy: ORDENES[orden],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    datos: alimentos.map((a) => formatearAlimento(a)),
    total,
    page,
    limit,
    totalPaginas: Math.max(1, Math.ceil(total / limit)),
  });
});

// GET /api/alimentos/:id
router.get('/:id', validar(esquemaId, 'params'), async (req, res) => {
  const { id } = req.datos.params;
  const alimento = await prisma.alimento.findUnique({
    where: { id },
    include: {
      ingredientes: {
        where: { receta: { publicada: true } },
        select: { receta: { select: { id: true, titulo: true, imagenUrl: true } } },
        take: 12,
      },
      _count: { select: { ingredientes: true } },
    },
  });
  if (!alimento) throw new HttpError(404, 'Alimento no encontrado');

  const vistas = new Set();
  const recetas = [];
  for (const ing of alimento.ingredientes) {
    if (!vistas.has(ing.receta.id)) {
      vistas.add(ing.receta.id);
      recetas.push(ing.receta);
    }
  }
  res.json(formatearAlimento(alimento, { recetas, numRecetas: alimento._count.ingredientes }));
});

// POST /api/alimentos  (cualquier usuario autenticado puede añadir)
router.post('/', requerirAuth, validar(esquemaAlimento), async (req, res) => {
  const alimento = await prisma.alimento.create({ data: req.datos.body });
  res.status(201).json(formatearAlimento(alimento));
});

// PUT /api/alimentos/:id  (solo admin)
router.put('/:id', requerirAuth, requerirRol('admin'), validar(esquemaId, 'params'), validar(esquemaAlimento), async (req, res) => {
  const alimento = await prisma.alimento.update({
    where: { id: req.datos.params.id },
    data: req.datos.body,
  });
  res.json(formatearAlimento(alimento));
});

// DELETE /api/alimentos/:id  (solo admin)
router.delete('/:id', requerirAuth, requerirRol('admin'), validar(esquemaId, 'params'), async (req, res) => {
  await prisma.alimento.delete({ where: { id: req.datos.params.id } });
  res.status(204).end();
});

export default router;
