import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/formularios.css';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(form);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-page auth-page">
      <div className="form-card form-card--auth">
        <h1 className="form-title">Iniciar sesión</h1>
        <p className="form-subtitle">Accede para guardar favoritos, valorar y publicar tus recetas.</p>

        {error && <div className="alerta alerta-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={enviar}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={cambiar}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            <LogIn size={18} /> {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-alt">
          ¿No tienes cuenta? <Link to="/registro" state={location.state}>Regístrate</Link>
        </p>

        {import.meta.env.DEV && (
          <div className="auth-demo">
            <strong>Solo en desarrollo</strong>
            <span>Contraseña inicial de las cuentas creadas por la semilla: <code>Serenity123</code></span>
          </div>
        )}
      </div>
    </div>
  );
}
