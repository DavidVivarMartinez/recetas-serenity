# Frontend · Recetas Serenity

SPA en React 19 + Vite 7 + React Router 7. Habla con la API del backend a través del proxy `/api`
configurado en `vite.config.js` (destino por defecto `http://localhost:3001`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run lint
```

## Estructura

```
src/
├── components/
│   ├── Navbar, NavbarTabs, Footer      navegación (según sesión)
│   ├── RecetaForm                      formulario crear/editar receta (con buscador de alimentos)
│   ├── RecipeCoverflow                 carrusel de la portada (Swiper)
│   ├── TarjetaReceta, Estrellas        piezas reutilizables
│   ├── RutaPrivada.jsx                 envuelve rutas que requieren sesión
│   └── ScrollToTop.jsx
├── context/  AuthContext.jsx + auth.js  sesión (token JWT en localStorage)
├── hooks/    useAuth.js
├── pages/    Home, Recetas, RecetaDetalle, NuevaReceta, EditarReceta,
│             Alimentos, Perfil, Login, Registro, MenuSemanal, NotFound,
│             ComoFunciona (desactivada: ruta comentada en App.jsx)
├── services/ api.js                    cliente HTTP y funciones por recurso
├── styles/   formularios.css           botones, formularios, tablas y modales compartidos
└── utils/    video.js                  normaliza enlaces de YouTube/Vimeo
```

## Rutas

| Ruta                    | Acceso   |
| ----------------------- | -------- |
| `/`                     | público  |
| `/recetas`              | sesión   |
| `/recetas/nueva`        | sesión   |
| `/receta/:id`           | público  |
| `/receta/:id/editar`    | autor/admin |
| `/alimentos`            | público  |
| `/perfil`               | sesión   |
| `/usuarios/:id`         | público  |
| `/login`, `/registro`   | público  |
| `/menu-semanal`         | público (en construcción) |

Variables opcionales en `.env` (ver `.env.example`): `VITE_API_URL` y `VITE_PROXY_TARGET`.
