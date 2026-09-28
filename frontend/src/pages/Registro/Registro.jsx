import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/formularios.css';
import '../Login/Auth.css';

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde || '/';

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setDetalles([]);

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await registro({ nombre: form.nombre, email: form.email, password: form.password });
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
      setDetalles(err.detalles ?? []);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-page auth-page">
      <div className="form-card form-card--auth">
        <h1 className="form-title">Crear cuenta</h1>
        <p className="form-subtitle">Únete para publicar tus recetas y guardar tus favoritas.</p>

        {error && (
          <div className="alerta alerta-error" role="alert">
            {error}
            {detalles.length > 0 && (
              <ul>
                {detalles.map((d, i) => (
                  <li key={i}>{d.campo}: {d.mensaje}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form className="auth-form" onSubmit={enviar}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-nombre">Nombre</label>
            <input
              id="reg-nombre"
              className="form-input"
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              autoComplete="name"
              minLength={2}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={cambiar}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={cambiar}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="form-hint">Mínimo 8 caracteres.</span>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirmar">Repite la contraseña</label>
            <input
              id="reg-confirmar"
              className="form-input"
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={cambiar}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            <UserPlus size={18} /> {enviando ? 'Creando cuenta…' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link to="/login" state={location.state}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
