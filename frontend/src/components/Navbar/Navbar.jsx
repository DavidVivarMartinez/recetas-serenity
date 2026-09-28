import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Menu, X, ChevronDown, LogIn, LogOut, Plus, Heart, UserPlus, Apple } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => setIsUserMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cerrar menús al cambiar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // "Recetas" solo se muestra con sesión iniciada
  const navLinks = [
    ...(usuario ? [{ path: '/recetas', label: 'RECETAS' }] : []),
    { path: '/alimentos', label: 'ALIMENTOS' },
    { path: '/menu-semanal', label: 'MENÚ SEMANAL' },
  ];

  const cerrarSesion = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const nombreCorto = usuario?.nombre?.split(' ')[0];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🍳</div>
          <span className="logo-text">Serenity!</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links-desktop">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {usuario ? (
            <>
              <Link to="/recetas/nueva" className="action-button nueva-receta-link" title="Publicar receta">
                <Plus size={20} />
                <span className="action-label">Nueva receta</span>
              </Link>

              {/* User Menu */}
              <div className="user-menu-container">
                <button
                  className="action-button user-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {usuario.avatarUrl ? (
                    <img src={usuario.avatarUrl} alt="" className="user-avatar" />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="action-label">{nombreCorto}</span>
                  <ChevronDown size={16} className={`chevron ${isUserMenuOpen ? 'open' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="dropdown-header">
                      <strong>{usuario.nombre}</strong>
                      <small>{usuario.email}</small>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link to="/perfil" className="dropdown-item" role="menuitem">
                      <User size={16} />
                      Mi perfil
                    </Link>
                    <Link to="/perfil" state={{ tab: 'favoritas' }} className="dropdown-item" role="menuitem">
                      <Heart size={16} />
                      Mis favoritas
                    </Link>
                    <Link to="/recetas/nueva" className="dropdown-item" role="menuitem">
                      <Plus size={16} />
                      Nueva receta
                    </Link>
                    <Link to="/alimentos" className="dropdown-item" role="menuitem">
                      <Apple size={16} />
                      Tabla de alimentos
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={cerrarSesion} role="menuitem">
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" state={{ desde: location.pathname }} className="action-button">
                <LogIn size={20} />
                <span className="action-label">Entrar</span>
              </Link>
              <Link to="/registro" className="action-button action-button--primary registro-link">
                <UserPlus size={20} />
                <span className="action-label">Registrarse</span>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mobile-actions">
            {usuario ? (
              <>
                <Link to="/perfil" className="mobile-action-link">
                  <User size={18} />
                  Mi perfil
                </Link>
                <Link to="/recetas/nueva" className="mobile-action-link">
                  <Plus size={18} />
                  Nueva receta
                </Link>
                <button type="button" className="mobile-action-link mobile-action-button" onClick={cerrarSesion}>
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-action-link">
                  <LogIn size={18} />
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="mobile-action-link">
                  <UserPlus size={18} />
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
