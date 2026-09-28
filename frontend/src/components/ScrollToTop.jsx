import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Sube al principio de la página al cambiar de ruta. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
