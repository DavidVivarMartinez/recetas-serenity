import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import RecetaForm from '../../components/RecetaForm/RecetaForm';
import { recetasApi } from '../../services/api';
import '../../styles/formularios.css';

export default function EditarReceta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    recetasApi
      .obtener(id)
      .then((r) => activo && setReceta(r))
      .catch((e) => activo && setErrorCarga(e))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [id]);

  const guardar = async (payload) => {
    setGuardando(true);
    setError(null);
    try {
      const actualizada = await recetasApi.actualizar(id, payload);
      navigate(`/receta/${actualizada.id}`);
    } catch (e) {
      setError(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    if (!window.confirm('¿Seguro que quieres borrar esta receta? No se puede deshacer.')) return;
    try {
      await recetasApi.eliminar(id);
      navigate('/perfil', { replace: true });
    } catch (e) {
      setError(e);
    }
  };

  if (cargando) return <div className="pagina-cargando">Cargando receta…</div>;

  if (errorCarga || !receta) {
    return (
      <div className="estado-vacio">
        <h3>No se pudo cargar la receta</h3>
        <p>{errorCarga?.message}</p>
        <Link to="/recetas" className="btn btn-primary">Volver a recetas</Link>
      </div>
    );
  }

  if (!receta.puedeEditar) {
    return (
      <div className="estado-vacio">
        <h3>No puedes editar esta receta</h3>
        <p>Solo el autor o un administrador pueden modificarla.</p>
        <Link to={`/receta/${id}`} className="btn btn-primary">Ver la receta</Link>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card form-card--wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to={`/receta/${id}`} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Volver a la receta</Link>
          <button type="button" className="btn btn-danger btn-sm" onClick={borrar}><Trash2 size={16} /> Borrar receta</button>
        </div>
        <h1 className="form-title" style={{ marginTop: '0.75rem' }}>Editar receta</h1>
        <p className="form-subtitle">Modifica los datos y guarda los cambios.</p>
        <RecetaForm key={receta.id} inicial={receta} onGuardar={guardar} guardando={guardando} error={error} textoBoton="Guardar cambios" />
      </div>
    </div>
  );
}
