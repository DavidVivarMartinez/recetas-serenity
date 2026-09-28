import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import recetasRoutes from './routes/recetas.js';
import alimentosRoutes from './routes/alimentos.js';
import estadisticasRoutes from './routes/estadisticas.js';
import { noEncontrado, manejadorErrores } from './middleware/errores.js';

export function crearApp() {
  const app = express();

  // CORS_ORIGIN admite URLs exactas y comodines de subdominio ("*.vercel.app")
  const origenes = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origenPermitido = (origen) => {
    if (!origen || !origenes.length) return true; // sin cabecera Origin (curl, misma app) o sin lista configurada
    return origenes.some((o) => {
      if (o.startsWith('*.')) {
        try {
          return new URL(origen).hostname.endsWith(o.slice(1));
        } catch {
          return false;
        }
      }
      return o === origen;
    });
  };
  app.use(cors({ origin: (origen, cb) => cb(null, origenPermitido(origen)) }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/salud', (req, res) => {
    res.json({ ok: true, servicio: 'recetas-serenity-api', hora: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/recetas', recetasRoutes);
  app.use('/api/alimentos', alimentosRoutes);
  app.use('/api/estadisticas', estadisticasRoutes);

  app.use(noEncontrado);
  app.use(manejadorErrores);
  return app;
}
