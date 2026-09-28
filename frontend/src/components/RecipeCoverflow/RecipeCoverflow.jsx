import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Keyboard } from 'swiper/modules';
import { Clock, Flame, Star } from 'lucide-react';
import { formatearTiempo } from '../../services/api';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import './RecipeCoverflow.css';

// Pide a Unsplash la foto al doble de tamaño para que se vea nítida en la slide
const sharpImage = (src = '') => src.replace('w=400&h=300', 'w=800&h=600');

// Recibe recetas con las claves de la API (titulo, imagenUrl, valoracionMedia...)
const RecipeCoverflow = ({ recipes = [] }) => {
  if (!recipes.length) return null;

  return (
    <div className="recipe-coverflow">
      <Swiper
        grabCursor
        centeredSlides
        slidesPerView={1.4}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        speed={600}
        effect="coverflow"
        loop
        loopAdditionalSlides={2}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: recipes.length > 7 }}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        modules={[EffectCoverflow, Pagination, Keyboard]}
        a11y={{ enabled: true }}
      >
        {recipes.map((recipe) => (
          <SwiperSlide
            key={recipe.id}
            className="recipe-coverflow__slide"
            style={{ backgroundImage: `url(${sharpImage(recipe.imagenUrl || '')})` }}
            role="group"
            aria-label={recipe.titulo}
          >
            <div className="recipe-coverflow__top">
              <span className="recipe-coverflow__chip">{recipe.categoria}</span>
              {recipe.valoracionMedia ? (
                <span className="recipe-coverflow__chip recipe-coverflow__chip--rating">
                  <Star size={14} fill="currentColor" strokeWidth={0} />
                  {recipe.valoracionMedia.toFixed(1)}
                </span>
              ) : null}
            </div>

            <div className="recipe-coverflow__content">
              <h3 className="recipe-coverflow__title">{recipe.titulo}</h3>
              <p className="recipe-coverflow__meta">
                <span><Clock size={16} /> {formatearTiempo(recipe.tiempoTotal)}</span>
                {recipe.calorias ? <span><Flame size={16} /> {recipe.calorias} kcal</span> : null}
              </p>
              <Link to={`/receta/${recipe.id}`} className="recipe-coverflow__btn">
                Ver receta
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RecipeCoverflow;
