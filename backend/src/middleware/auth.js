import { prisma } from '../lib/prisma.js';
import { verificarToken } from '../lib/jwt.js';
import { HttpError } from '../lib/errores.js';

export const SELECT_USUARIO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  avatarUrl: true,
  bio: true,
  creadoEn: true,
};

export const SELECT_USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  avatarUrl: true,
  bio: true,
  creadoEn: true,
};

async function usuarioDesdeCabecera(req) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) return null;

  let payload;
  try {
    payload = verificarToken(token);
  } catch {
    throw new HttpError(401, 'Token inválido o caducado');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(payload.sub) },
    select: SELECT_USUARIO,
  });
  if (!usuario) throw new HttpError(401, 'El usuario del token ya no existe');
  return usuario;
}

/** Exige un usuario autenticado; lo deja en req.usuario. */
export async function requerirAuth(req, res, next) {
  const usuario = await usuarioDesdeCabecera(req);
  if (!usuario) throw new HttpError(401, 'Necesitas iniciar sesión');
  req.usuario = usuario;
  next();
}

/** Carga el usuario si hay token válido; si no, sigue como anónimo. */
export async function authOpcional(req, res, next) {
  try {
    req.usuario = await usuarioDesdeCabecera(req);
  } catch {
    req.usuario = null;
  }
  next();
}

/** Exige que el usuario ya cargado tenga uno de los roles indicados. */
export function requerirRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      throw new HttpError(403, 'No tienes permisos para esta acción');
    }
    next();
  };
}
