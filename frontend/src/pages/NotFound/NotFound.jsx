import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

// Iconos SVG
const Home = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const Search = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ArrowLeft = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
);

const ChefHat = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Recetas sugeridas (datos temporales incluidos)
  const suggestedRecipes = [
    {
      id: 1,
      title: "Ensalada César",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
      time: "20 min",
      difficulty: "Fácil"
    },
    {
      id: 2,
      title: "Pasta Carbonara",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
      time: "25 min",
      difficulty: "Medio"
    },
    {
      id: 3,
      title: "Salmón Teriyaki",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
      time: "30 min",
      difficulty: "Medio"
    }
  ];

  useEffect(() => {
    let timer;
    if (isRedirecting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      navigate('/');
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isRedirecting, navigate]);

  const startRedirect = () => {
    setIsRedirecting(true);
  };

  const cancelRedirect = () => {
    setIsRedirecting(false);
    setCountdown(10);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        {/* Animación del chef perdido */}
        <div className="chef-animation">
          <div className="chef-hat">
            <ChefHat className="chef-hat-icon" />
          </div>
          <div className="floating-ingredients">
            <div className="ingredient tomato"></div>
            <div className="ingredient carrot"></div>
            <div className="ingredient lettuce"></div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">¡Receta no encontrada!</h1>
          <p className="error-description">
            Parece que esta receta se ha perdido en la cocina. 
            No te preocupes, tenemos muchas otras deliciosas opciones para ti.
          </p>

          {/* Acciones principales */}
          <div className="action-buttons">
            <Link to="/" className="home-button">
              <Home className="button-icon" />
              <span>Ir al inicio</span>
            </Link>
            
            <Link to="/recetas" className="recipes-button">
              <Search className="button-icon" />
              <span>Ver recetas</span>
            </Link>
            
            <button onClick={() => navigate(-1)} className="back-button">
              <ArrowLeft className="button-icon" />
              <span>Volver atrás</span>
            </button>
          </div>

          {/* Redirección automática */}
          <div className="auto-redirect">
            {!isRedirecting ? (
              <button onClick={startRedirect} className="redirect-trigger">
                ¿Prefieres que te lleve al inicio automáticamente?
              </button>
            ) : (
              <div className="redirect-active">
                <p>Redirigiendo al inicio en <span className="countdown">{countdown}</span> segundos...</p>
                <button onClick={cancelRedirect} className="cancel-redirect">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recetas sugeridas */}
        <div className="suggested-recipes">
          <h3 className="suggestions-title">Mientras tanto, ¿qué tal estas recetas?</h3>
          <div className="recipes-grid">
            {suggestedRecipes.map(recipe => (
              <Link 
                key={recipe.id} 
                to={`/receta/${recipe.id}`} 
                className="recipe-suggestion"
              >
                <div className="recipe-image-container">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="recipe-image"
                  />
                  <div className="recipe-overlay">
                    <div className="recipe-info">
                      <h4 className="recipe-title">{recipe.title}</h4>
                      <div className="recipe-meta">
                        <div className="meta-item">
                          <Clock className="meta-icon" />
                          <span>{recipe.time}</span>
                        </div>
                        <span className="difficulty">{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Consejos útiles */}
        <div className="helpful-tips">
          <h3 className="tips-title">Consejos útiles:</h3>
          <ul className="tips-list">
            <li>Verifica que la URL esté escrita correctamente</li>
            <li>Usa el buscador para encontrar recetas específicas</li>
            <li>Explora nuestras categorías de recetas</li>
            <li>Revisa nuestras recetas más populares</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="not-found-footer">
          <p>¿Buscas algo para cocinar? <Link to="/alimentos" className="help-link">Explora la tabla de alimentos</Link></p>
          <p className="copyright">© {new Date().getFullYear()} Recetas Serenity · David Vivar Martínez</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;