import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Star, ArrowRight, BookOpen, Apple, Heart, Video, LogIn } from 'lucide-react';
import RecipeCoverflow from '../../components/RecipeCoverflow/RecipeCoverflow';
import { recetasApi, estadisticasApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Home.css';

const testimonials = [
  {
    name: 'María González',
    text: 'Gracias a Recetas Serenity he perdido 8kg en 3 meses. Las recetas son deliciosas y fáciles de seguir.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Carlos Ruiz',
    text: 'Poder ver las calorías y los macros de cada receta me ha cambiado la forma de cocinar. Ahora como mejor y más variado.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Ana López',
    text: 'Como madre de familia, me encanta que pueda filtrar por tiempo de preparación. ¡15 minutos y listo!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
  },
];

const formatearNumero = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return String(n);
};

const Home = () => {
  const { usuario } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [recetas, setRecetas] = useState([]);
  const [errorRecetas, setErrorRecetas] = useState(null);
  const [stats, setStats] = useState(null);

  // Recetas destacadas y estadísticas desde la API
  useEffect(() => {
    let activo = true;
    recetasApi
      .listar({ limit: 12, orden: 'valoracion' })
      .then((r) => activo && setRecetas(r.datos))
      .catch((e) => activo && setErrorRecetas(e));
    estadisticasApi
      .obtener()
      .then((s) => activo && setStats(s))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const testimonio = testimonials[currentTestimonial];

  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-badge">
              <ChefHat className="hero-badge-icon" />
              <span className="hero-badge-text">Tu cocina inteligente</span>
            </div>

            <h1 className="hero-title">Recetas Serenity</h1>

            <p className="hero-description">
              Descubre, cocina y comparte recetas
              <span className="hero-highlight-orange"> con su información nutricional</span>, calculada a
              partir de nuestra
              <span className="hero-highlight-green"> tabla de alimentos</span>
            </p>

            <div className="hero-buttons">
              {usuario ? (
                <>
                  <Link to="/recetas/nueva" className="hero-btn-primary">
                    Publicar una receta
                    <ArrowRight className="btn-icon" />
                  </Link>
                  <Link to="/recetas" className="hero-btn-secondary">
                    <BookOpen className="btn-icon-left" />
                    Ver recetas
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/registro" className="hero-btn-primary">
                    Crear cuenta gratis
                    <ArrowRight className="btn-icon" />
                  </Link>
                  <Link to="/login" className="hero-btn-secondary">
                    <LogIn className="btn-icon-left" />
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number stat-orange">{formatearNumero(stats?.recetas)}</div>
                <div className="stat-label">Recetas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-green">{formatearNumero(stats?.alimentos)}</div>
                <div className="stat-label">Alimentos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-purple">
                  {stats?.valoracionMedia ? `${stats.valoracionMedia}★` : '—'}
                </div>
                <div className="stat-label">Valoración media</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recetas destacadas */}
      <section
        id="recipes"
        data-animate
        className={`recipes-section ${isVisible.recipes ? 'section-visible' : 'section-hidden'}`}
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Recetas destacadas</h2>
            <p className="section-subtitle">
              {stats?.recetas
                ? `Las mejor valoradas de nuestras ${stats.recetas} recetas`
                : 'Las recetas mejor valoradas por la comunidad'}
            </p>
          </div>

          {errorRecetas ? (
            <p className="home-aviso">No se pudieron cargar las recetas: {errorRecetas.message}</p>
          ) : (
            <RecipeCoverflow recipes={recetas} />
          )}

          <div className="recipes-cta">
            <Link to="/recetas" className="view-all-recipes-btn">
              Ver todas las recetas
              <ArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Qué puedes hacer */}
      <section
        id="features"
        data-animate
        className={`features-section ${isVisible.features ? 'section-visible' : 'section-hidden'}`}
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Todo lo que puedes hacer</h2>
            <p className="section-subtitle">Una comunidad para cocinar mejor y saber qué comes</p>
          </div>

          <div className="features-grid">
            <Link to={usuario ? '/recetas/nueva' : '/registro'} className="feature-card">
              <div className="feature-icon feature-icon--orange"><Video /></div>
              <h3>Publica tus recetas</h3>
              <p>Ingredientes, pasos, etiquetas y un enlace a tu vídeo de YouTube o Vimeo.</p>
            </Link>
            <Link to="/alimentos" className="feature-card">
              <div className="feature-icon feature-icon--green"><Apple /></div>
              <h3>Tabla de alimentos</h3>
              <p>Valores nutricionales por 100 g. Enlaza los ingredientes y la receta calcula sus calorías y macros.</p>
            </Link>
            <Link to={usuario ? '/perfil' : '/login'} className="feature-card">
              <div className="feature-icon feature-icon--purple"><Heart /></div>
              <h3>Guarda y valora</h3>
              <p>Marca favoritas, puntúa con estrellas y comenta las recetas de la comunidad.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section
        id="testimonials"
        data-animate
        className={`testimonials-section ${isVisible.testimonials ? 'section-visible' : 'section-hidden'}`}
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Lo que dicen nuestros usuarios</h2>
            <p className="section-subtitle">Personas que ya cocinan y comparten con Recetas Serenity</p>
          </div>

          <div className="testimonial-container">
            <div className="testimonial-card">
              <div className="testimonial-gradient"></div>

              <div className="testimonial-content">
                <img src={testimonio.image} alt={testimonio.name} className="testimonial-avatar" />

                <div className="testimonial-rating">
                  {[...Array(testimonio.rating)].map((_, i) => (
                    <Star key={i} className="testimonial-star" />
                  ))}
                </div>

                <blockquote className="testimonial-quote">"{testimonio.text}"</blockquote>

                <cite className="testimonial-author">{testimonio.name}</cite>
              </div>

              <div className="testimonial-dots">
                {testimonials.map((t, index) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setCurrentTestimonial(index)}
                    className={`testimonial-dot ${index === currentTestimonial ? 'dot-active' : ''}`}
                    aria-label={`Ver testimonio de ${t.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">¿Listo para cocinar mejor?</h2>
          <p className="cta-subtitle">
            Únete a la comunidad, publica tus recetas y descubre qué hay en cada plato
          </p>

          <div className="cta-buttons">
            {usuario ? (
              <Link to="/recetas/nueva" className="cta-btn-primary">Publicar una receta</Link>
            ) : (
              <Link to="/registro" className="cta-btn-primary">Empezar ahora</Link>
            )}
            <Link to="/alimentos" className="cta-btn-secondary">Explorar la tabla de alimentos</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
