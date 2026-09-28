import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecetaForm from '../../components/RecetaForm/RecetaForm';
import { recetasApi } from '../../services/api';
import '../../styles/formularios.css';

export default function NuevaReceta() {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async (payload) => {
    setGuardando(true);
    setError(null);
    try {
      const receta = await recetasApi.crear(payload);
      navigate(`/receta/${receta.id}`);
    } catch (e) {
      setError(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card form-card--wide">
        <Link to="/recetas" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Volver a recetas</Link>
        <h1 className="form-title" style={{ marginTop: '0.75rem' }}>Nueva receta</h1>
        <p className="form-subtitle">
          Comparte tu receta con la comunidad. Puedes enlazar un vídeo de YouTube o Vimeo y vincular los
          ingredientes con la tabla de alimentos para calcular su información nutricional.
        </p>
        <RecetaForm onGuardar={guardar} guardando={guardando} error={error} textoBoton="Publicar receta" />
      </div>
    </div>
  );
}
