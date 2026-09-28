import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { firmarToken } from '../lib/jwt.js';
import { HttpError } from '../lib/errores.js';
import { validar } from '../middleware/validar.js';
import { requerirAuth, SELECT_USUARIO } from '../middleware/auth.js';

const router = Router();

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(60),
  email: z.string().trim().toLowerCase().email('Email no válido').max(120),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email('Email no válido'),
  password: z.string().min(1, 'Introduce la contraseña'),
});

// POST /api/auth/registro
router.post('/registro', validar(esquemaRegistro), async (req, res) => {
  const { nombre, email, password } = req.datos.body;

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) throw new HttpError(409, 'Ya existe una cuenta con ese email');

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash },
    select: SELECT_USUARIO,
  });

  res.status(201).json({ token: firmarToken(usuario), usuario });
});

// POST /api/auth/login
router.post('/login', validar(esquemaLogin), async (req, res) => {
  const { email, password } = req.datos.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const ok = usuario && (await bcrypt.compare(password, usuario.passwordHash));
  if (!ok) throw new HttpError(401, 'Email o contraseña incorrectos');

  const publico = Object.fromEntries(Object.keys(SELECT_USUARIO).map((k) => [k, usuario[k]]));
  res.json({ token: firmarToken(usuario), usuario: publico });
});

// GET /api/auth/yo
router.get('/yo', requerirAuth, async (req, res) => {
  const contadores = await prisma.usuario.findUnique({
    where: { id: req.usuario.id },
    select: { _count: { select: { recetas: true, favoritos: true, valoraciones: true } } },
  });
  res.json({ ...req.usuario, contadores: contadores?._count ?? {} });
});

export default router;
