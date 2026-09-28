import { NavLink, useLocation } from 'react-router-dom';
import { House, BookOpen, Apple, UtensilsCrossed, User, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './NavbarTabs.css';

// Pestañas por defecto. "Recetas" y "Mi perfil" solo aparecen con sesión iniciada.
const construirItems = (usuario) => [
  { name: 'Inicio', to: '/', icon: House },
  ...(usuario ? [{ name: 'Recetas', to: '/recetas', icon: BookOpen }] : []),
  { name: 'Alimentos', to: '/alimentos', icon: Apple },
  { name: 'Menú semanal', to: '/menu-semanal', icon: UtensilsCrossed },
  usuario
    ? { name: 'Mi perfil', to: '/perfil', icon: User }
    : { name: 'Entrar', to: '/login', icon: LogIn },
];

const NavbarTabs = ({ items, fixed = true, hideOnDesktop = true }) => {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const tabs = items ?? construirItems(usuario);

  // Pestaña activa: coincidencia exacta para "/", por prefijo para el resto
  const activeIndex = tabs.findIndex((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
  );

  const classes = [
    'navbar-tabs',
    fixed && 'navbar-tabs--fixed',
    hideOnDesktop && 'navbar-tabs--mobile-only',
  ].filter(Boolean).join(' ');

  return (
    <nav
      className={classes}
      aria-label="Navegación principal"
      style={{ '--tabs-count': tabs.length, '--tabs-active': Math.max(activeIndex, 0) }}
    >
      <div className="navbar-tabs__bar">
        {activeIndex >= 0 && (
          <span className="navbar-tabs__indicator" aria-hidden="true">
            <span className="navbar-tabs__hump" />
            <span className="navbar-tabs__bubble" />
          </span>
        )}

        {tabs.map((item) => {
          const Icono = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `navbar-tabs__item ${isActive ? 'navbar-tabs__item--active' : ''}`
              }
              aria-label={item.name}
              title={item.name}
            >
              <Icono className="navbar-tabs__icon" size={24} strokeWidth={2} />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default NavbarTabs;
