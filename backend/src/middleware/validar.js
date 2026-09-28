import { HttpError } from '../lib/errores.js';

/**
 * Valida req[origen] con un esquema zod y deja el resultado limpio en
 * req.datos[origen]. (En Express 5 req.query es de solo lectura, por eso no
 * se sobrescribe.)
 */
export function validar(esquema, origen = 'body') {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[origen] ?? {});
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((i) => ({
        campo: i.path.join('.') || origen,
        mensaje: i.message,
      }));
      throw new HttpError(400, 'Datos no válidos', detalles);
    }
    req.datos = { ...(req.datos || {}), [origen]: resultado.data };
    next();
  };
}
