import { normalizarVideo } from './video.js';
import { calcularNutricion } from './nutricion.js';
import { formatearAlimento } from './alimento.js';

export const DIFICULTADES = ['Fácil', 'Medio', 'Difícil'];

const SELECT_AUTOR = { id: true, nombre: true, avatarUrl: true };

export function parseEtiquetas(texto) {
  try {
    const v = JSON.parse(texto);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** include de Prisma para el listado (tarjetas). */
export function includeResumen(usuarioId) {
  return {
    autor: { select: SELECT_AUTOR },
    _count: { select: { favoritos: true, valoraciones: true } },
    ...(usuarioId
      ? { favoritos: { where: { usuarioId }, select: { usuarioId: true } } }
      : {}),
  };
}

/** include de Prisma para el detalle completo. */
export function includeDetalle(usuarioId) {
  return {
    ...includeResumen(usuarioId),
    ingredientes: { orderBy: { orden: 'asc' }, include: { alimento: true } },
    pasos: { orderBy: { orden: 'asc' } },
    valoraciones: {
      orderBy: { creadoEn: 'desc' },
      include: { usuario: { select: SELECT_AUTOR } },
    },
  };
}

export function formatearResumen(r) {
  return {
    id: r.id,
    titulo: r.titulo,
    descripcion: r.descripcion,
    imagenUrl: r.imagenUrl,
    videoUrl: r.videoUrl,
    tiempoTotal: r.tiempoTotal,
    tiempoPreparacion: r.tiempoPreparacion,
    tiempoCoccion: r.tiempoCoccion,
    dificultad: r.dificultad,
    categoria: r.categoria,
    porciones: r.porciones,
    etiquetas: parseEtiquetas(r.etiquetas),
    calorias: r.calorias,
    valoracionMedia: r.valoracionMedia,
    numValoraciones: r._count?.valoraciones ?? r.numValoraciones,
    numFavoritos: r._count?.favoritos ?? 0,
    esFavorita: Array.isArray(r.favoritos) ? r.favoritos.length > 0 : false,
    publicada: r.publicada,
    autor: r.autor,
    creadoEn: r.creadoEn,
    actualizadoEn: r.actualizadoEn,
  };
}

export function formatearDetalle(r, usuario) {
  const video = normalizarVideo(r.videoUrl);
  const miValoracion = usuario
    ? r.valoraciones.find((v) => v.usuarioId === usuario.id) ?? null
    : null;

  return {
    ...formatearResumen(r),
    videoEmbedUrl: video?.embedUrl ?? null,
    videoProveedor: video?.proveedor ?? null,
    nutricion: {
      calorias: r.calorias,
      proteinas: r.proteinas,
      carbohidratos: r.carbohidratos,
      grasas: r.grasas,
      fibra: r.fibra,
      azucares: r.azucares,
      sodio: r.sodio,
    },
    nutricionCalculada: calcularNutricion(r.ingredientes, r.porciones),
    ingredientes: r.ingredientes.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      cantidad: i.cantidad,
      unidad: i.unidad,
      nota: i.nota,
      alimento: i.alimento ? formatearAlimento(i.alimento) : null,
    })),
    pasos: r.pasos.map((p) => ({
      id: p.id,
      orden: p.orden,
      titulo: p.titulo,
      descripcion: p.descripcion,
      tiempoMin: p.tiempoMin,
      consejo: p.consejo,
    })),
    valoraciones: r.valoraciones.map((v) => ({
      id: v.id,
      puntuacion: v.puntuacion,
      comentario: v.comentario,
      creadoEn: v.creadoEn,
      usuario: v.usuario,
    })),
    miValoracion: miValoracion
      ? { id: miValoracion.id, puntuacion: miValoracion.puntuacion, comentario: miValoracion.comentario }
      : null,
    puedeEditar: Boolean(usuario && (usuario.id === r.autorId || usuario.rol === 'admin')),
  };
}

/** Recalcula media y número de valoraciones de una receta (denormalizado). */
export async function recalcularValoracion(prisma, recetaId) {
  const agg = await prisma.valoracion.aggregate({
    where: { recetaId },
    _avg: { puntuacion: true },
    _count: true,
  });
  const media = Math.round((agg._avg.puntuacion ?? 0) * 10) / 10;
  await prisma.receta.update({
    where: { id: recetaId },
    data: { valoracionMedia: media, numValoraciones: agg._count },
  });
  return { valoracionMedia: media, numValoraciones: agg._count };
}
