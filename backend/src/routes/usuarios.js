import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errores.js';
import { validar } from '../middleware/validar.js';
import { requerirAuth, authOpcional, SELECT_USUARIO, SELECT_USUARIO_PUBLICO } from '../middleware/auth.js';
import { includeResumen, formatearResumen } from '../utils/receta.js';

const router = Router();

const esquemaId = z.object({ id: z.coerce.number().int().positive() });

const urlOpcional = z
  .union([z.string().trim().url('URL no válida').max(500), z.literal('')])
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

const esquemaActualizar = z
  .object({
    nombre: z.string().trim().min(2).max(60).optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    avatarUrl: urlOpcional,
    password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(72).optional(),
    passwordActual: z.string().optional(),
  })
  .refine((d) => !d.password || d.passwordActual, {
    message: 'Para cambiar la contraseña debes indicar la actual',
    path: ['passwordActual'],
  });

// PATCH /api/usuarios/yo  (debe ir antes de /:id)
router.patch('/yo', requerirAuth, validar(esquemaActualizar), async (req, res) => {
  const { nombre, bio, avatarUrl, password, passwordActual } = req.datos.body;
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  if (password) {
    const actual = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
    const ok = await bcrypt.compare(passwordActual, actual.passwordHash);
    if (!ok) throw new HttpError(400, 'La contraseña actual no es correcta');
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.usuario.id },
    data,
    select: SELECT_USUARIO,
  });
  res.json(usuario);
});

// GET /api/usuarios/:id  -> perfil público con sus recetas publicadas
router.get('/:id', validar(esquemaId, 'params'), authOpcional, async (req, res) => {
  const { id } = req.datos.params;
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ...SELECT_USUARIO_PUBLICO, _count: { select: { favoritos: true, valoraciones: true } } },
  });
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');

  const recetas = await prisma.receta.findMany({
    where: { autorId: id, publicada: true },
    orderBy: { creadoEn: 'desc' },
    include: includeResumen(req.usuario?.id),
  });

  const { _count, ...publico } = usuario;
  res.json({
    ...publico,
    contadores: { recetas: recetas.length, favoritos: _count.favoritos, valoraciones: _count.valoraciones },
    recetas: recetas.map(formatearResumen),
  });
});

export default router;
