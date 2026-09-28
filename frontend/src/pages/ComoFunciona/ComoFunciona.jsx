import React from 'react';
import './ComoFunciona.css';

// Iconos SVG
const Search = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const BookOpen = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const ChefHat = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const Smartphone = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const Download = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ComoFunciona = () => {
  const steps = [
    {
      number: 1,
      title: "Descubre Recetas",
      description: "Explora nuestra amplia biblioteca de recetas organizadas por categorías, dificultad y tiempo de preparación.",
      features: [
        "Más de 10,000 recetas disponibles",
        "Filtros avanzados por ingredientes",
        "Categorías por tipo de cocina",
        "Recetas veganas, vegetarianas y sin gluten"
      ],
      icon: <Search className="step-icon" />,
      className: "step-1",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      number: 2,
      title: "Planifica tu Menú",
      description: "Selecciona tus recetas favoritas y crea tu plan semanal personalizado con listas de compras automáticas.",
      features: [
        "Planificador semanal inteligente",
        "Lista de compras generada automáticamente",
        "Cálculo nutricional completo",
        "Ajuste de porciones automático"
      ],
      icon: <BookOpen className="step-icon" />,
      className: "step-2",
      image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      number: 3,
      title: "Cocina Paso a Paso",
      description: "Sigue nuestras instrucciones detalladas con temporizadores integrados y videos explicativos.",
      features: [
        "Instrucciones paso a paso",
        "Temporizadores integrados",
        "Videos tutoriales HD",
        "Modo manos libres con comandos de voz"
      ],
      icon: <ChefHat className="step-icon" />,
      className: "step-3",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      number: 4,
      title: "Disfruta y Comparte",
      description: "Guarda tus recetas favoritas, califica los platos y comparte tus creaciones con la comunidad.",
      features: [
        "Biblioteca personal de favoritos",
        "Sistema de calificaciones",
        "Compartir en redes sociales",
        "Comunidad de foodies activa"
      ],
      icon: <Heart className="step-icon" />,
      className: "step-4",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const features = [
    {
      title: "Disponible 24/7",
      description: "Accede a todas las recetas desde cualquier dispositivo, en cualquier momento.",
      icon: <Clock />
    },
    {
      title: "Comunidad Activa",
      description: "Únete a miles de usuarios que comparten tips, variaciones y fotos de sus platos.",
      icon: <Users />
    },
    {
      title: "App Móvil",
      description: "Lleva todas las recetas en tu bolsillo con nuestra app nativa para iOS y Android.",
      icon: <Smartphone />
    },
    {
      title: "Contenido Premium",
      description: "Accede a recetas exclusivas de chefs reconocidos y masterclasses en vivo.",
      icon: <Star />
    }
  ];

  return (
    <div className="como-funciona-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">¿Cómo Funciona?</h1>
        <p className="hero-subtitle">
          Transforma tu forma de cocinar en 4 simples pasos
        </p>
        <p className="hero-description">
          Recetas Serenity te acompaña desde la inspiración hasta el plato final, 
          haciendo que cocinar sea fácil, divertido y delicioso para todos.
        </p>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="steps-title">Tu Journey Culinario en 4 Pasos</h2>
          
          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={step.number} className={`step-card ${step.className} ${index % 2 === 1 ? 'reverse' : ''}`}>
                <div className="step-image-container">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="step-image"
                  />
                </div>
                
                <div className="step-content">
                  <div className="step-number">{step.number}</div>
                  
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  
                  <ul className="step-features">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="step-feature">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="process-flow">
            <div className="flow-step">Descubre</div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step">Planifica</div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step">Cocina</div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-step">Disfruta</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">¿Por Qué Elegir Recetas Serenity?</h2>
          <p className="features-subtitle">
            Más que una app de recetas, es tu compañero culinario definitivo
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para Empezar tu Adventure Culinario?</h2>
          <p className="cta-description">
            Únete a miles de usuarios que ya han transformado su forma de cocinar
          </p>
          <div className="cta-buttons">
            <button className="cta-button">
              <Download style={{ width: '20px', height: '20px' }} />
              Descargar App Gratis
            </button>
            <button className="cta-button secondary">
              Ver Recetas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComoFunciona;