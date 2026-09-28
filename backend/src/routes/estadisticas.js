import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/estadisticas  -> números globales para la portada
router.get('/', async (req, res) => {
  const [recetas, alimentos, usuarios, valoraciones, media] = await Promise.all([
    prisma.receta.count({ where: { publicada: true } }),
    prisma.alimento.count(),
    prisma.usuario.count(),
    prisma.valoracion.count(),
    prisma.valoracion.aggregate({ _avg: { puntuacion: true } }),
  ]);

  res.json({
    recetas,
    alimentos,
    usuarios,
    valoraciones,
    valoracionMedia: Math.round((media._avg.puntuacion ?? 0) * 10) / 10,
  });
});

export default router;
