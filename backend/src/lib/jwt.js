import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('Falta JWT_SECRET en el fichero .env del backend');
}

export function firmarToken(usuario) {
  return jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, SECRET, {
    expiresIn: process.env.JWT_EXPIRA || '7d',
  });
}

export function verificarToken(token) {
  return jwt.verify(token, SECRET);
}
