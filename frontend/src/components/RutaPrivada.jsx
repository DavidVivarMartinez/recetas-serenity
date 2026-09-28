import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Envuelve una ruta que requiere sesión (y opcionalmente rol admin). */
export default function RutaPrivada({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <div className="pagina-cargando">Cargando…</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/" replace />;
  return children;
}
