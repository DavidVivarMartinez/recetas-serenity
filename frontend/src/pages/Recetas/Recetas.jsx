import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { recetasApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import TarjetaReceta from '../../components/TarjetaReceta/TarjetaReceta';
import '../../styles/formularios.css';
import './Recetas.css';

// Iconos SVG
const Search = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const Filter = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);

const ArrowLeft = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
);

const Loader = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const DIFICULTADES = ['Fácil', 'Medio', 'Difícil'];
const RANGOS_TIEMPO = {
  all: {},
  '0-15': { tiempoHasta: 15 },
  '15-30': { tiempoMasDe: 15, tiempoHasta: 30 },
  '30+': { tiempoMasDe: 30 },
};
const ORDENES = [
  ['recientes', 'Más recientes'],
  ['valoracion', 'Mejor valoradas'],
  ['populares', 'Más populares'],
  ['tiempo', 'Más rápidas'],
];
const RECETAS_POR_PAGINA = 8;

const Recetas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [busqueda, setBusqueda] = useState(searchTerm.trim());
  const [filterCategory, setFilterCategory] = useState(searchParams.get('categoria') ?? 'all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [etiqueta, setEtiqueta] = useState(searchParams.get('etiqueta') ?? '');
  const [orden, setOrden] = useState('recientes');
  const [showFilters, setShowFilters] = useState(false);

  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usuarioId = usuario?.id;

  // Categorías desde la API
  useEffect(() => {
    recetasApi.categorias().then(setCategories).catch(() => {});
  }, []);

  // Búsqueda con retardo
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Al cambiar los filtros, volver a la primera página
  useEffect(() => {
    setPage(1);
  }, [busqueda, filterCategory, filterDifficulty, filterTime, etiqueta, orden]);

  // Cargar recetas desde la API
  useEffect(() => {
    let activo = true;
    setLoading(true);
    setError(null);
    recetasApi
      .listar({
        q: busqueda,
        categoria: filterCategory,
        dificultad: filterDifficulty === 'all' ? undefined : filterDifficulty,
        etiqueta,
        orden,
        page,
        limit: RECETAS_POR_PAGINA,
        ...RANGOS_TIEMPO[filterTime],
      })
      .then((r) => {
        if (!activo) return;
        setRecipes((prev) => (page === 1 ? r.datos : [...prev, ...r.datos]));
        setTotal(r.total);
        setTotalPaginas(r.totalPaginas);
      })
      .catch((e) => activo && setError(e))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [busqueda, filterCategory, filterDifficulty, filterTime, etiqueta, orden, page, usuarioId]);

  const hasMore = page < totalPaginas;

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 800) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const toggleFavorite = async (receta) => {
    if (!usuario) {
      navigate('/login', { state: { desde: location.pathname } });
      return;
    }
    try {
      const r = await recetasApi.toggleFavorito(receta.id);
      setRecipes((prev) => prev.map((x) => (x.id === receta.id ? { ...x, esFavorita: r.esFavorita, numFavoritos: r.numFavoritos } : x)));
    } catch (e) {
      setError(e);
    }
  };

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterDifficulty('all');
    setFilterTime('all');
    setEtiqueta('');
    setOrden('recientes');
    setSearchTerm('');
  };

  const hayFiltros = filterCategory !== 'all' || filterDifficulty !== 'all' || filterTime !== 'all' || etiqueta || busqueda;

  return (
    <div className="recetas-page">
      {/* Header */}
      <header className="recetas-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="back-button">
              <ArrowLeft className="back-icon" />
              <span>Volver al inicio</span>
            </Link>

            <div className="header-text">
              <h1 className="page-title">Nuestras Recetas</h1>
              <p className="page-subtitle">
                {total ? `Descubre ${total} deliciosas recetas para todos los gustos` : 'Recetas para todos los gustos'}
              </p>
            </div>

            <Link to="/recetas/nueva" className="back-button nueva-receta-btn">
              <Plus className="back-icon" />
              <span>Publicar receta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Búsqueda y Filtros */}
      <section className="search-filters-section">
        <div className="container">
          <div className="search-bar">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar recetas, ingredientes o etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="filter-icon" />
              <span>Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Categoría</label>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="all">Todas</option>
                    {categories.map((c) => (
                      <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.total})</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Dificultad</label>
                  <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="filter-select">
                    <option value="all">Todas</option>
                    {DIFICULTADES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Tiempo</label>
                  <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="filter-select">
                    <option value="all">Cualquiera</option>
                    <option value="0-15">Hasta 15 min</option>
                    <option value="15-30">15-30 min</option>
                    <option value="30+">Más de 30 min</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Ordenar por</label>
                  <select value={orden} onChange={(e) => setOrden(e.target.value)} className="filter-select">
                    {ORDENES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                <button className="reset-filters-btn" onClick={resetFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          <div className="results-info">
            <p>
              Mostrando {recipes.length} de {total} recetas
              {busqueda && <span> para "{busqueda}"</span>}
              {etiqueta && (
                <span>
                  {' '}con la etiqueta <strong>{etiqueta}</strong>{' '}
                  <button type="button" className="quitar-etiqueta" onClick={() => setEtiqueta('')}>quitar</button>
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Rejilla de recetas */}
      <section className="recipes-grid-section">
        <div className="container">
          {error && (
            <div className="no-results">
              <h3>No se pudieron cargar las recetas</h3>
              <p>{error.message}</p>
              <button className="reset-filters-btn" onClick={() => setPage((p) => p)}>Reintentar</button>
            </div>
          )}

          {!error && recipes.length > 0 && (
            <>
              <div className="grid-tarjetas">
                {recipes.map((recipe) => (
                  <TarjetaReceta key={recipe.id} receta={recipe} onFavorito={toggleFavorite} />
                ))}
              </div>

              {loading && (
                <div className="loading-container">
                  <Loader className="loading-spinner" />
                  <p>Cargando más recetas...</p>
                </div>
              )}

              {!loading && hasMore && (
                <div className="end-message">
                  <button className="reset-filters-btn" onClick={() => setPage((p) => p + 1)}>Cargar más recetas</button>
                </div>
              )}

              {!hasMore && !loading && (
                <div className="end-message">
                  <p>¡Has visto todas las recetas disponibles!</p>
                </div>
              )}
            </>
          )}

          {!error && recipes.length === 0 && loading && (
            <div className="loading-container">
              <Loader className="loading-spinner" />
              <p>Cargando recetas...</p>
            </div>
          )}

          {!error && recipes.length === 0 && !loading && (
            <div className="no-results">
              <h3>No se encontraron recetas</h3>
              <p>{hayFiltros ? 'Prueba ajustando los filtros o cambiando el término de búsqueda' : 'Todavía no hay recetas publicadas.'}</p>
              {hayFiltros && (
                <button className="reset-filters-btn" onClick={resetFilters}>
                  Mostrar todas las recetas
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Recetas;
