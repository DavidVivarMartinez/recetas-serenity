import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, BookOpen, Heart, Settings } from 'lucide-react';
import { recetasApi, usuariosApi, formatearFecha } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import TarjetaReceta from '../../components/TarjetaReceta/TarjetaReceta';
import '../../styles/formularios.css';
import './Perfil.css';

const inicial = (nombre = '') => nombre.trim().charAt(0).toUpperCase() || '?';

function FormularioAjustes({ usuario, onGuardado }) {
  const [form, setForm] = useState({
    nombre: usuario.nombre ?? '',
    bio: usuario.bio ?? '',
    avatarUrl: usuario.avatarUrl ?? '',
    passwordActual: '',
    password: '',
  });
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    setError(null);
    try {
      const datos = { nombre: form.nombre, bio: form.bio, avatarUrl: form.avatarUrl };
      if (form.password) {
        datos.password = form.password;
        datos.passwordActual = form.passwordActual;
      }
      const actualizado = await usuariosApi.actualizarYo(datos);
      onGuardado(actualizado);
      setForm((f) => ({ ...f, passwordActual: '', password: '' }));
      setMensaje('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="form-card perfil-ajustes" onSubmit={enviar}>
      {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
      {error && (
        <div className="alerta alerta-error">
          {error.message}
          {error.detalles?.length > 0 && (
            <ul>{error.detalles.map((d, i) => <li key={i}>{d.campo}: {d.mensaje}</li>)}</ul>
          )}
        </div>
      )}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="pf-nombre">Nombre</label>
          <input id="pf-nombre" className="form-input" name="nombre" value={form.nombre} onChange={cambiar} minLength={2} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pf-avatar">URL del avatar</label>
          <input id="pf-avatar" className="form-input" name="avatarUrl" type="url" value={form.avatarUrl} onChange={cambiar} placeholder="https://…" />
        </div>
        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="pf-bio">Sobre ti</label>
          <textarea id="pf-bio" className="form-textarea" name="bio" value={form.bio} onChange={cambiar} maxLength={500} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pf-pass-actual">Contraseña actual</label>
          <input id="pf-pass-actual" className="form-input" name="passwordActual" type="password" value={form.passwordActual} onChange={cambiar} autoComplete="current-password" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pf-pass">Nueva contraseña</label>
          <input id="pf-pass" className="form-input" name="password" type="password" value={form.password} onChange={cambiar} autoComplete="new-password" minLength={8} />
          <span className="form-hint">Déjala vacía si no quieres cambiarla.</span>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
    </form>
  );
}

export default function Perfil() {
  const { id } = useParams();
  const { usuario, setUsuario } = useAuth();
  const propio = !id || (usuario != null && Number(id) === usuario.id);
  const usuarioId = usuario?.id;

  const [perfil, setPerfil] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [favoritas, setFavoritas] = useState([]);
  const [tab, setTab] = useState('recetas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    const cargar = async () => {
      try {
        if (propio) {
          const [mias, favs] = await Promise.all([recetasApi.mias(), recetasApi.favoritas()]);
          if (!activo) return;
          setRecetas(mias);
          setFavoritas(favs);
        } else {
          const p = await usuariosApi.perfil(id);
          if (!activo) return;
          setPerfil(p);
          setRecetas(p.recetas);
          setFavoritas([]);
        }
      } catch (e) {
        if (activo) setError(e);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [id, propio, usuarioId]);

  const toggleFavorito = async (r) => {
    try {
      const res = await recetasApi.toggleFavorito(r.id);
      const aplicar = (x) => (x.id === r.id ? { ...x, esFavorita: res.esFavorita, numFavoritos: res.numFavoritos } : x);
      setRecetas((prev) => prev.map(aplicar));
      setFavoritas((prev) => (res.esFavorita ? prev.map(aplicar) : prev.filter((x) => x.id !== r.id)));
    } catch (e) {
      setError(e);
    }
  };

  const datos = propio ? usuario : perfil;

  if (cargando) return <div className="pagina-cargando">Cargando perfil…</div>;
  if (error || !datos) {
    return (
      <div className="estado-vacio">
        <h3>{error?.status === 404 ? 'Usuario no encontrado' : 'No se pudo cargar el perfil'}</h3>
        <p>{error?.message}</p>
        <Link to="/recetas" className="btn btn-primary">Ver recetas</Link>
      </div>
    );
  }

  const contadores = propio
    ? { recetas: recetas.length, favoritos: favoritas.length }
    : datos.contadores ?? { recetas: recetas.length, favoritos: 0 };

  return (
    <div className="perfil-page">
      <header className="perfil-cabecera">
        <div className="perfil-cabecera__inner">
          {datos.avatarUrl ? (
            <img className="perfil-avatar" src={datos.avatarUrl} alt={datos.nombre} />
          ) : (
            <div className="perfil-avatar perfil-avatar--letra" aria-hidden="true">{inicial(datos.nombre)}</div>
          )}
          <div className="perfil-info">
            <h1>{datos.nombre}</h1>
            {datos.bio && <p className="perfil-bio">{datos.bio}</p>}
            <p className="perfil-desde">
              {propio && datos.email ? `${datos.email} · ` : ''}
              Miembro desde {formatearFecha(datos.creadoEn)}
              {datos.rol === 'admin' ? ' · Administrador' : ''}
            </p>
            <div className="perfil-contadores">
              <span><strong>{contadores.recetas}</strong> recetas</span>
              <span><strong>{contadores.favoritos}</strong> favoritas</span>
            </div>
          </div>
          {propio && (
            <Link to="/recetas/nueva" className="btn btn-primary"><Plus size={18} /> Nueva receta</Link>
          )}
        </div>
      </header>

      <div className="pagina-ancha">
        <div className="tabs">
          <button type="button" className={`tab ${tab === 'recetas' ? 'activa' : ''}`} onClick={() => setTab('recetas')}>
            <BookOpen size={16} /> {propio ? 'Mis recetas' : 'Recetas'} ({recetas.length})
          </button>
          {propio && (
            <button type="button" className={`tab ${tab === 'favoritas' ? 'activa' : ''}`} onClick={() => setTab('favoritas')}>
              <Heart size={16} /> Favoritas ({favoritas.length})
            </button>
          )}
          {propio && (
            <button type="button" className={`tab ${tab === 'ajustes' ? 'activa' : ''}`} onClick={() => setTab('ajustes')}>
              <Settings size={16} /> Ajustes
            </button>
          )}
        </div>

        {tab === 'recetas' && (
          recetas.length ? (
            <div className="grid-tarjetas">
              {recetas.map((r) => (
                <TarjetaReceta
                  key={r.id}
                  receta={r}
                  mostrarEstado={propio}
                  enlaceEditar={propio}
                  onFavorito={usuario && !propio ? toggleFavorito : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="estado-vacio">
              <h3>{propio ? 'Todavía no has publicado ninguna receta' : 'Este usuario aún no ha publicado recetas'}</h3>
              {propio && <Link to="/recetas/nueva" className="btn btn-primary"><Plus size={18} /> Crear mi primera receta</Link>}
            </div>
          )
        )}

        {tab === 'favoritas' && propio && (
          favoritas.length ? (
            <div className="grid-tarjetas">
              {favoritas.map((r) => <TarjetaReceta key={r.id} receta={r} onFavorito={toggleFavorito} />)}
            </div>
          ) : (
            <div className="estado-vacio">
              <h3>Aún no tienes recetas favoritas</h3>
              <Link to="/recetas" className="btn btn-primary">Explorar recetas</Link>
            </div>
          )
        )}

        {tab === 'ajustes' && propio && (
          <FormularioAjustes usuario={usuario} onGuardado={(u) => setUsuario((prev) => ({ ...prev, ...u }))} />
        )}
      </div>
    </div>
  );
}
