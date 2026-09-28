import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Clock, Users, Star, Plus, Minus, Printer,
  Pencil, Trash2, ExternalLink, Link2, Check,
} from 'lucide-react';
import { recetasApi, formatearTiempo, formatearCantidad, formatearFecha } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Estrellas from '../../components/Estrellas/Estrellas';
import './RecetaDetalle.css';

const FILAS_DECLARADA = [
  ['calorias', 'Calorías', 'kcal'], ['proteinas', 'Proteína', 'g'], ['carbohidratos', 'Carbohidratos', 'g'],
  ['grasas', 'Grasas', 'g'], ['fibra', 'Fibra', 'g'], ['azucares', 'Azúcar', 'g'], ['sodio', 'Sodio', 'mg'],
];
const FILAS_CALCULADA = [
  ['calorias', 'Calorías', 'kcal'], ['proteinas', 'Proteína', 'g'], ['carbohidratos', 'Carbohidratos', 'g'],
  ['grasas', 'Grasas', 'g'], ['fibra', 'Fibra', 'g'], ['azucares', 'Azúcar', 'g'], ['sal', 'Sal', 'g'],
];

const inicial = (nombre = '') => nombre.trim().charAt(0).toUpperCase() || '?';
const fmtNum = (v, unidad) => (v === null || v === undefined ? '—' : `${Math.round(v * 10) / 10}${unidad === 'kcal' ? '' : unidad}`);

const RecetaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const [receta, setReceta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [porciones, setPorciones] = useState(4);
  const [verCalculada, setVerCalculada] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [errorValoracion, setErrorValoracion] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    recetasApi
      .obtener(id)
      .then((r) => {
        if (!activo) return;
        setReceta(r);
        setPorciones(r.porciones);
        setPuntuacion(r.miValoracion?.puntuacion ?? 0);
        setComentario(r.miValoracion?.comentario ?? '');
      })
      .catch((e) => activo && setError(e))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [id, usuarioId]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const irALogin = () => navigate('/login', { state: { desde: location.pathname } });

  const toggleFavorito = async () => {
    if (!usuario) return irALogin();
    try {
      const r = await recetasApi.toggleFavorito(receta.id);
      setReceta((prev) => ({ ...prev, esFavorita: r.esFavorita, numFavoritos: r.numFavoritos }));
    } catch (e) {
      setAviso(e.message);
    }
  };

  const ajustarPorciones = (delta) => setPorciones((p) => Math.min(24, Math.max(1, p + delta)));

  const compartir = async () => {
    const datos = { title: receta.titulo, text: receta.descripcion, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(datos);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      /* el usuario canceló */
    }
  };

  const enviarValoracion = async (e) => {
    e.preventDefault();
    if (!usuario) return irALogin();
    if (!puntuacion) {
      setErrorValoracion('Elige una puntuación de 1 a 5 estrellas.');
      return;
    }
    setEnviandoValoracion(true);
    setErrorValoracion(null);
    try {
      const r = await recetasApi.valorar(receta.id, { puntuacion, comentario });
      setReceta((prev) => ({
        ...prev,
        valoracionMedia: r.valoracionMedia,
        numValoraciones: r.numValoraciones,
        miValoracion: { id: r.valoracion.id, puntuacion: r.valoracion.puntuacion, comentario: r.valoracion.comentario },
        valoraciones: [r.valoracion, ...prev.valoraciones.filter((v) => v.usuario.id !== usuario.id)],
      }));
      setAviso(prev => prev ?? 'Gracias por tu valoración.');
    } catch (err) {
      setErrorValoracion(err.message);
    } finally {
      setEnviandoValoracion(false);
    }
  };

  const quitarValoracion = async () => {
    try {
      const r = await recetasApi.quitarValoracion(receta.id);
      setReceta((prev) => ({
        ...prev,
        valoracionMedia: r.valoracionMedia,
        numValoraciones: r.numValoraciones,
        miValoracion: null,
        valoraciones: prev.valoraciones.filter((v) => v.usuario.id !== usuario.id),
      }));
      setPuntuacion(0);
      setComentario('');
    } catch (err) {
      setErrorValoracion(err.message);
    }
  };

  const borrarReceta = async () => {
    if (!window.confirm('¿Seguro que quieres borrar esta receta? No se puede deshacer.')) return;
    setBorrando(true);
    try {
      await recetasApi.eliminar(receta.id);
      navigate('/recetas', { replace: true });
    } catch (err) {
      setAviso(err.message);
      setBorrando(false);
    }
  };

  if (cargando) {
    return (
      <div className="receta-detalle-page">
        <div className="pagina-cargando">Cargando receta…</div>
      </div>
    );
  }

  if (error || !receta) {
    const noEncontrada = error?.status === 404;
    return (
      <div className="receta-detalle-page">
        <div className="estado-vacio">
          <h3>{noEncontrada ? 'Receta no encontrada' : 'No se pudo cargar la receta'}</h3>
          <p>{noEncontrada ? 'Puede que se haya borrado o que el enlace no sea correcto.' : error?.message}</p>
          <Link to="/recetas" className="btn btn-primary">Volver a recetas</Link>
        </div>
      </div>
    );
  }

  const factor = porciones / (receta.porciones || 1);
  const calculada = receta.nutricionCalculada;
  const mostrarCalculada = verCalculada && calculada;
  const filasNutricion = mostrarCalculada
    ? FILAS_CALCULADA.map(([k, etiqueta, unidad]) => [etiqueta, calculada.porPorcion[k], unidad])
    : FILAS_DECLARADA.map(([k, etiqueta, unidad]) => [etiqueta, receta.nutricion[k], unidad]);
  const hayNutricionDeclarada = FILAS_DECLARADA.some(([k]) => receta.nutricion[k] != null);
  const esAutor = usuario && receta.autor?.id === usuario.id;

  return (
    <div className="receta-detalle-page">
      {aviso && <div className="aviso-flotante" role="status">{aviso}</div>}

      {/* Hero */}
      <section className="recipe-hero">
        {receta.imagenUrl && <img src={receta.imagenUrl} alt={receta.titulo} className="recipe-hero-image" />}
        <div className="recipe-hero-overlay"></div>

        <div className="recipe-hero-content">
          <div className="recipe-hero-header">
            <Link to="/recetas" className="back-button">
              <ArrowLeft className="back-icon" />
              <span>Volver a recetas</span>
            </Link>

            <div className="hero-actions">
              {receta.puedeEditar && (
                <>
                  <Link to={`/receta/${receta.id}/editar`} className="hero-btn-editar"><Pencil size={16} /> Editar</Link>
                  <button type="button" className="hero-btn-editar hero-btn-borrar" onClick={borrarReceta} disabled={borrando}><Trash2 size={16} /> Borrar</button>
                </>
              )}
              <button
                type="button"
                className={`favorite-btn ${receta.esFavorita ? 'favorite-active' : ''}`}
                onClick={toggleFavorito}
                aria-label={receta.esFavorita ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                title={`${receta.numFavoritos} ${receta.numFavoritos === 1 ? 'persona la ha guardado' : 'personas la han guardado'}`}
              >
                <Heart className="heart-icon" />
              </button>
              <button type="button" className="share-btn" onClick={compartir} aria-label="Compartir">
                {copiado ? <Check className="share-icon" /> : <Share2 className="share-icon" />}
              </button>
            </div>
          </div>

          <h1 className="recipe-hero-title">{receta.titulo}</h1>

          <div className="recipe-hero-meta">
            <div className="hero-meta-item">
              <Clock className="meta-icon" />
              <span>{formatearTiempo(receta.tiempoTotal)}</span>
            </div>
            <div className="hero-meta-item">
              <Users className="meta-icon" />
              <span>{receta.porciones} pers.</span>
            </div>
            <div className="hero-meta-item">
              <Star className="meta-icon rating-star" />
              <span>
                {receta.valoracionMedia ? receta.valoracionMedia.toFixed(1) : 'Nueva'}
                {receta.numValoraciones ? ` (${receta.numValoraciones})` : ''}
              </span>
            </div>
            <div className={`difficulty-badge difficulty-${receta.dificultad.toLowerCase()}`}>{receta.dificultad}</div>
            <div className="hero-meta-item">{receta.categoria}</div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <div className="recipe-content">
        <div className="recipe-main">
          {/* Columna izquierda */}
          <div className="recipe-left">
            <section className="recipe-description">
              <h2>Acerca de esta receta</h2>
              <p>{receta.descripcion}</p>
              {(receta.tiempoPreparacion || receta.tiempoCoccion) && (
                <p className="recipe-times">
                  {receta.tiempoPreparacion ? `Preparación: ${formatearTiempo(receta.tiempoPreparacion)}` : ''}
                  {receta.tiempoPreparacion && receta.tiempoCoccion ? ' · ' : ''}
                  {receta.tiempoCoccion ? `Cocción: ${formatearTiempo(receta.tiempoCoccion)}` : ''}
                </p>
              )}
            </section>

            {receta.autor && (
              <section className="recipe-author">
                {receta.autor.avatarUrl ? (
                  <img className="author-avatar" src={receta.autor.avatarUrl} alt={receta.autor.nombre} />
                ) : (
                  <div className="author-avatar" aria-hidden="true">{inicial(receta.autor.nombre)}</div>
                )}
                <div className="author-info">
                  <small>Receta de</small>
                  <Link to={esAutor ? '/perfil' : `/usuarios/${receta.autor.id}`}>{receta.autor.nombre}</Link>
                  <small>
                    Publicada el {formatearFecha(receta.creadoEn)}
                    {receta.fuente === 'themealdb' && receta.fuenteUrl && (
                      <>
                        {' · '}Importada de{' '}
                        <a href={receta.fuenteUrl} target="_blank" rel="noopener noreferrer">TheMealDB</a>
                      </>
                    )}
                  </small>
                </div>
              </section>
            )}

            {(receta.videoEmbedUrl || receta.videoUrl) && (
              <section className="recipe-video">
                <h2>Vídeo de la receta</h2>
                {receta.videoEmbedUrl ? (
                  <div className="video-wrap">
                    <iframe
                      src={receta.videoEmbedUrl}
                      title={`Vídeo: ${receta.titulo}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <a className="video-link" href={receta.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={18} /> Ver el vídeo en el sitio original
                  </a>
                )}
              </section>
            )}

            {receta.etiquetas.length > 0 && (
              <section className="recipe-tags">
                <h3>Etiquetas</h3>
                <div className="tags-list">
                  {receta.etiquetas.map((tag) => (
                    <Link key={tag} to={`/recetas?etiqueta=${encodeURIComponent(tag)}`} className="tag tag-link">{tag}</Link>
                  ))}
                </div>
              </section>
            )}

            <section className="recipe-instructions">
              <h2>Instrucciones paso a paso</h2>
              <ol className="instructions-list">
                {receta.pasos.map((paso) => (
                  <li key={paso.id} className="instruction-step">
                    <div className="step-number">{paso.orden}</div>
                    <div className="step-content">
                      {(paso.titulo || paso.tiempoMin) && (
                        <div className="step-header">
                          {paso.titulo && <span className="step-title">{paso.titulo}</span>}
                          {paso.tiempoMin ? <span className="step-time"><Clock size={13} /> {formatearTiempo(paso.tiempoMin)}</span> : null}
                        </div>
                      )}
                      <p className="step-text">{paso.descripcion}</p>
                      {paso.consejo && <p className="step-tip">Consejo: {paso.consejo}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Valoraciones */}
            <section className="reviews-section">
              <div className="reviews-header">
                <h2>Valoraciones</h2>
                <div className="reviews-summary">
                  <strong>{receta.valoracionMedia ? receta.valoracionMedia.toFixed(1) : '—'}</strong>
                  <Estrellas valor={receta.valoracionMedia} />
                  <span>{receta.numValoraciones} {receta.numValoraciones === 1 ? 'valoración' : 'valoraciones'}</span>
                </div>
              </div>

              {!usuario && (
                <p className="login-hint">
                  <Link to="/login" state={{ desde: location.pathname }}>Inicia sesión</Link> para valorar esta receta.
                </p>
              )}

              {usuario && !esAutor && (
                <form className="review-form" onSubmit={enviarValoracion}>
                  <strong>{receta.miValoracion ? 'Tu valoración' : 'Valora esta receta'}</strong>
                  <Estrellas valor={puntuacion} onChange={setPuntuacion} tamano={26} />
                  <textarea
                    className="form-textarea"
                    placeholder="¿Qué te ha parecido? (opcional)"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    maxLength={1000}
                  />
                  {errorValoracion && <span className="form-error">{errorValoracion}</span>}
                  <div className="review-form__acciones">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={enviandoValoracion}>
                      {enviandoValoracion ? 'Enviando…' : receta.miValoracion ? 'Actualizar valoración' : 'Enviar valoración'}
                    </button>
                    {receta.miValoracion && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={quitarValoracion}>Quitar mi valoración</button>
                    )}
                  </div>
                </form>
              )}

              {receta.valoraciones.length ? (
                <ul className="review-list">
                  {receta.valoraciones.map((v) => (
                    <li key={v.id} className="review-item">
                      {v.usuario.avatarUrl ? (
                        <img className="review-avatar" src={v.usuario.avatarUrl} alt="" />
                      ) : (
                        <div className="review-avatar" aria-hidden="true">{inicial(v.usuario.nombre)}</div>
                      )}
                      <div className="review-body">
                        <div className="review-meta">
                          <strong>{v.usuario.nombre}</strong>
                          <Estrellas valor={v.puntuacion} tamano={14} />
                          <time dateTime={v.creadoEn}>{formatearFecha(v.creadoEn)}</time>
                        </div>
                        {v.comentario && <p className="review-text">{v.comentario}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="form-hint">Todavía no hay valoraciones. ¡Sé el primero!</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="recipe-sidebar">
            <div className="recipe-info-card">
              <h3>Ajustar porciones</h3>
              <div className="servings-adjuster">
                <button type="button" className="servings-btn" onClick={() => ajustarPorciones(-1)} disabled={porciones <= 1} aria-label="Menos porciones">
                  <Minus />
                </button>
                <span className="servings-display">{porciones} pers.</span>
                <button type="button" className="servings-btn" onClick={() => ajustarPorciones(1)} disabled={porciones >= 24} aria-label="Más porciones">
                  <Plus />
                </button>
              </div>
              {porciones !== receta.porciones && (
                <p className="form-hint" style={{ textAlign: 'center', marginTop: '-0.75rem' }}>
                  Cantidades ajustadas desde {receta.porciones} porciones.
                </p>
              )}
            </div>

            <div className="recipe-info-card">
              <h3>Ingredientes</h3>
              <ul className="ingredients-list">
                {receta.ingredientes.map((ing) => (
                  <li key={ing.id} className="ingredient-item">
                    <div className="ingredient-main">
                      <span className="ingredient-name">{ing.nombre}</span>
                      {ing.nota && <span className="ingredient-note">{ing.nota}</span>}
                      {ing.alimento && (
                        <Link
                          className="ingredient-link"
                          to={`/alimentos?q=${encodeURIComponent(ing.alimento.nombre)}`}
                          title={`${ing.alimento.calorias} kcal por 100 ${ing.alimento.unidadBase}`}
                        >
                          <Link2 size={11} /> {ing.alimento.nombre}
                        </Link>
                      )}
                    </div>
                    <span className="ingredient-amount">
                      {formatearCantidad(ing.cantidad != null ? ing.cantidad * factor : null, ing.unidad)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {(hayNutricionDeclarada || calculada) && (
              <div className="recipe-info-card">
                <h3>Información nutricional</h3>
                {calculada && hayNutricionDeclarada && (
                  <div className="nutrition-toggle" role="tablist">
                    <button type="button" role="tab" aria-selected={!verCalculada} className={!verCalculada ? 'activo' : ''} onClick={() => setVerCalculada(false)}>Declarada</button>
                    <button type="button" role="tab" aria-selected={verCalculada} className={verCalculada ? 'activo' : ''} onClick={() => setVerCalculada(true)}>Calculada</button>
                  </div>
                )}
                <div className="nutrition-grid">
                  {filasNutricion.map(([etiqueta, valor, unidad]) => (
                    <div className="nutrition-item" key={etiqueta}>
                      <div className="nutrition-value">{fmtNum(valor, unidad)}</div>
                      <div className="nutrition-label">{etiqueta}</div>
                    </div>
                  ))}
                </div>
                <p className="nutrition-note">
                  {mostrarCalculada || (!hayNutricionDeclarada && calculada)
                    ? `Por porción, calculada con la tabla de alimentos a partir de ${calculada.ingredientesContabilizados} de ${calculada.ingredientesTotales} ingredientes.`
                    : 'Por porción, según los valores declarados por el autor.'}
                </p>
              </div>
            )}

            <div className="recipe-info-card">
              <h3>Acciones</h3>
              <div className="recipe-actions">
                <button type="button" className="action-btn primary" onClick={() => window.print()}>
                  <Printer className="action-icon" />
                  Imprimir receta
                </button>
                <button type="button" className="action-btn secondary" onClick={compartir}>
                  {copiado ? <Check className="action-icon" /> : <Share2 className="action-icon" />}
                  {copiado ? 'Enlace copiado' : 'Compartir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecetaDetalle;
