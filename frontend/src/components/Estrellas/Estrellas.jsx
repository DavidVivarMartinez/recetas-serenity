import { useState } from 'react';
import { Star } from 'lucide-react';
import './Estrellas.css';

/**
 * Muestra 1-5 estrellas. Si se pasa `onChange`, se pueden pulsar.
 */
export default function Estrellas({ valor = 0, onChange, tamano = 18, mostrarValor = false }) {
  const [hover, setHover] = useState(0);
  const interactivo = typeof onChange === 'function';
  const activo = hover || valor;

  return (
    <span
      className={`estrellas ${interactivo ? 'estrellas--interactivo' : ''}`}
      role={interactivo ? 'radiogroup' : 'img'}
      aria-label={`Valoración ${valor ? Number(valor).toFixed(1) : 0} de 5`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        interactivo ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            className={`estrella ${n <= activo ? 'llena' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
          >
            <Star size={tamano} />
          </button>
        ) : (
          <span key={n} className={`estrella ${n <= Math.round(activo) ? 'llena' : ''}`}>
            <Star size={tamano} />
          </span>
        ),
      )}
      {mostrarValor && (
        <span className="estrellas__valor">{valor ? Number(valor).toFixed(1) : 'Sin valorar'}</span>
      )}
    </span>
  );
}
