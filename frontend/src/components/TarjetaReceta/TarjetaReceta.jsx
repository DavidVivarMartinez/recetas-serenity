import { Link } from 'react-router-dom';
import { Heart, Star, Pencil } from 'lucide-react';
import { formatearTiempo } from '../../services/api';
import './TarjetaReceta.css';

/**
 * Tarjeta de receta (diseño Card: imagen que sobresale, texto y dos botones).
 * Props:
 *  - receta: objeto con las claves de la API (titulo, imagenUrl, tiempoTotal...)
 *  - onFavorito(receta): si se pasa, el botón secundario alterna favorito
 *  - enlaceEditar: si es true, el botón secundario lleva a editar la receta
 *  - mostrarEstado: muestra la etiqueta "Borrador" en recetas no publicadas
 */
export default function TarjetaReceta({ receta, onFavorito, enlaceEditar = false, mostrarEstado = false }) {
  const ruta = `/receta/${receta.id}`;
  const detalles = [
    receta.categoria,
    formatearTiempo(receta.tiempoTotal),
    receta.dificultad,
    receta.calorias ? `${receta.calorias} kcal` : null,
  ].filter(Boolean);

  return (
    <article className="tarjeta-receta">
      <Link to={ruta} className="tarjeta-receta__imagen-enlace" aria-label={receta.titulo}>
        {receta.imagenUrl ? (
          <img className="tarjeta-receta__imagen" src={receta.imagenUrl} alt="" loading="lazy" />
        ) : (
          <div className="tarjeta-receta__imagen tarjeta-receta__imagen--vacia" aria-hidden="true">🍽️</div>
        )}
      </Link>

      <div className="tarjeta-receta__cuerpo">
        {mostrarEstado && !receta.publicada && <span className="tarjeta-receta__borrador">Borrador</span>}

        <h2 className="tarjeta-receta__titulo">
          <Link to={ruta}>{receta.titulo}</Link>
        </h2>

        <h3 className="tarjeta-receta__subtitulo">
          <span>{detalles.join(' · ')}</span>
          {receta.valoracionMedia ? (
            <span className="tarjeta-receta__valoracion" title={`${receta.numValoraciones} valoraciones`}>
              <Star size={14} /> {receta.valoracionMedia.toFixed(1)}
            </span>
          ) : null}
        </h3>

        <p className="tarjeta-receta__descripcion">{receta.descripcion}</p>

        <div className="tarjeta-receta__botones">
          {enlaceEditar ? (
            <Link to={`${ruta}/editar`} className="tarjeta-receta__boton">
              <Pencil size={16} /> Editar
            </Link>
          ) : onFavorito ? (
            <button
              type="button"
              className={`tarjeta-receta__boton ${receta.esFavorita ? 'activo' : ''}`}
              onClick={() => onFavorito(receta)}
              aria-pressed={Boolean(receta.esFavorita)}
            >
              <Heart size={16} /> {receta.esFavorita ? 'Guardada' : 'Guardar'}
            </button>
          ) : null}
          <Link to={ruta} className="tarjeta-receta__boton tarjeta-receta__boton--primario">
            Ver receta
          </Link>
        </div>
      </div>
    </article>
  );
}
