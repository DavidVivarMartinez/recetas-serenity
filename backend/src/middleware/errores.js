import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/errores.js';

export function noEncontrado(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.detalles ? { detalles: err.detalles } : {}),
    });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un registro con esos datos', campo: err.meta?.target });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia a un registro que no existe' });
    }
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
