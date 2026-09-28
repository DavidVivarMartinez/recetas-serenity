import { Link } from 'react-router-dom';
import './Footer.css';

// Icono SVG ChefHat
const ChefHat = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <ChefHat className="footer-logo-icon" />
              <span className="footer-logo-text">Recetas Serenity</span>
            </div>
            <p className="footer-description">
              Recetas con su información nutricional, calculada a partir de una tabla de alimentos.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Plataforma</h4>
            <ul className="footer-links">
              <li><Link to="/recetas" className="footer-link">Recetas</Link></li>
              <li><Link to="/alimentos" className="footer-link">Tabla de alimentos</Link></li>
              <li><Link to="/recetas/nueva" className="footer-link">Publicar una receta</Link></li>
              <li><Link to="/menu-semanal" className="footer-link">Menú semanal</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Cuenta</h4>
            <ul className="footer-links">
              <li><Link to="/login" className="footer-link">Iniciar sesión</Link></li>
              <li><Link to="/registro" className="footer-link">Crear cuenta</Link></li>
              <li><Link to="/perfil" className="footer-link">Mi perfil</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Recetas Serenity · David Vivar Martínez.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
