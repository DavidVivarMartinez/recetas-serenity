# Recetas Serenity

Aplicación web de recetas con información nutricional. Los usuarios se registran, publican recetas
(con enlace a vídeo de YouTube/Vimeo), guardan favoritas, valoran y consultan una tabla de alimentos
con sus valores nutricionales. El nombre del proyecto es provisional.

```
TfgFinalComida-main/
├── frontend/   React 19 + Vite 7 + React Router 7   (http://localhost:5173)
├── backend/    Node 24 + Express 5 + Prisma 6 + SQLite (http://localhost:3001/api)
└── package.json  scripts para arrancar todo a la vez
```

## Arranque rápido

Requisitos: Node.js 20 o superior (probado con Node 24).

```bash
# 1. Instalar dependencias (raíz, backend y frontend)
npm run install:all

# 2. Configurar el backend
cp backend/.env.example backend/.env       # cambia JWT_SECRET
npm run db:setup                           # crea la BD SQLite y carga los datos de ejemplo

# 3. Arrancar backend y frontend a la vez
npm run dev
```

Abre <http://localhost:5173>. La API responde en <http://localhost:3001/api> y el frontend le habla a
través del proxy `/api` de Vite, así que no hay problemas de CORS en desarrollo.

También puedes arrancarlos por separado: `npm run dev:backend` y `npm run dev:frontend`.

### Cuentas

Las cuentas las define `backend/prisma/datos/usuarios.js` y las crea `npm run db:seed`. La contraseña
inicial se toma de la variable `SEED_PASSWORD` de `backend/.env`; si no está definida, la semilla genera una
al azar y la muestra por pantalla. Cada persona puede cambiarla desde "Mi perfil > Ajustes". La primera
cuenta es administradora y es la autora de las recetas de ejemplo.

## Qué hay en cada parte

**Backend** (`backend/README.md` tiene la lista completa de endpoints y el modelo de datos)

- Autenticación con JWT y contraseñas cifradas con bcrypt.
- Recetas con ingredientes, pasos, etiquetas, vídeo, nutrición declarada y nutrición calculada a partir
  de la tabla de alimentos.
- Tabla de alimentos (130 alimentos de ejemplo) con calorías, proteínas, carbohidratos, grasas,
  saturadas, fibra, azúcares y sal por 100 g/ml.
- Favoritos y valoraciones (1 a 5 estrellas con comentario).
- Permisos: solo el autor o un admin editan o borran una receta; los alimentos los puede añadir cualquier
  usuario registrado y solo el admin los edita o borra.

**Frontend**

- Portada con recetas destacadas y estadísticas reales de la API.
- Listado de recetas con filtros y scroll infinito (solo con sesión iniciada), detalle de receta (vídeo
  incrustado, ajuste de porciones, valoraciones, favoritos), tabla de alimentos, login, registro, perfil
  (mis recetas, favoritas, ajustes) y formulario para crear y editar recetas con buscador de alimentos.
- Páginas retiradas: suscripción y ayuda. "Cómo funciona" sigue en `frontend/src/pages/ComoFunciona`
  pero su ruta está comentada en `App.jsx`.

## Scripts útiles

| Comando                              | Qué hace                                             |
| ------------------------------------ | ---------------------------------------------------- |
| `npm run dev`                        | Arranca backend y frontend                            |
| `npm run db:seed`                    | Vuelve a cargar los datos de ejemplo                  |
| `npm run build`                      | Compila el frontend en `frontend/dist`                |
| `npm run lint`                       | Linter del frontend                                   |
| `npm run prisma:studio --prefix backend` | Explorador visual de la base de datos             |

## Base de datos

PostgreSQL alojado en [Neon](https://neon.tech) (plan gratuito). La rama principal es la de producción y
la rama `dev` la de desarrollo local. La cadena de conexión va en `backend/.env` (local) y en la variable
`DATABASE_URL` de Render (producción). Las migraciones están en `backend/prisma/migrations` y se aplican
con `npx prisma migrate deploy` (Render lo hace en cada despliegue).

## Despliegue

- **API en producción**: https://recetas-serenity-api.onrender.com/api (Render, región Ohio, plan gratuito).
- **Frontend**: Vercel, directorio raíz `frontend`, variable `VITE_API_URL` con la URL de la API
  (`https://recetas-serenity-api.onrender.com/api`). `frontend/vercel.json` redirige todas las rutas a la SPA.
- **Backend**: Render, definido en `render.yaml` (New > Blueprint). Variables: `DATABASE_URL` (Neon),
  `CORS_ORIGIN` (URL de Vercel; admite `*.vercel.app` para las previsualizaciones), `JWT_SECRET`
  (Render lo genera). El build ejecuta `prisma generate` y `prisma migrate deploy`.
- **Datos iniciales en producción**: desde tu máquina, apuntando a la base de producción:
  `DATABASE_URL="<url de Neon>" npm run db:seed --prefix backend` (en PowerShell:
  `$env:DATABASE_URL="<url>"; npm run db:seed --prefix backend`). Solo la primera vez: borra todo lo que haya.
- Ambos servicios redespliegan automáticamente con cada push a `main`.
- El plan gratuito de Render duerme el servicio tras 15 minutos sin uso; la primera petición tarda
  medio minuto en responder.
