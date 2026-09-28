# Backend · API de Recetas Serenity

API REST en **Node.js + Express 5** con **Prisma** sobre **SQLite** (desarrollo). Gestiona usuarios,
recetas con enlaces a vídeo, la tabla de alimentos con sus valores nutricionales, favoritos y valoraciones.

## Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env        # y cambia JWT_SECRET
npx prisma migrate dev      # crea prisma/dev.db y genera el cliente
npm run db:seed             # carga usuarios, 120 alimentos y 20 recetas de ejemplo
npm run dev                 # http://localhost:3001/api  (recarga automática)
```

Otros scripts: `npm start` (sin recarga), `npm run prisma:studio` (explorador visual de la BD),
`npm run db:reset` (borra la BD, aplica migraciones y vuelve a sembrar).

### Variables de entorno (`.env`)

| Variable      | Descripción                                        | Ejemplo                       |
| ------------- | -------------------------------------------------- | ----------------------------- |
| `PORT`        | Puerto de la API                                   | `3001`                        |
| `DATABASE_URL`| Conexión Prisma (relativa a `prisma/schema.prisma`) | `file:./dev.db`               |
| `JWT_SECRET`  | Secreto para firmar los tokens                     | cadena aleatoria larga        |
| `JWT_EXPIRA`  | Caducidad del token                                | `7d`                          |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas           | `http://localhost:5173`       |

### Usuarios (tras `npm run db:seed`)

Se crean las cuentas definidas en `prisma/datos/usuarios.js`, todas con la contraseña inicial `Serenity123`
(cambiable desde el perfil). La primera es administradora y queda como autora de las recetas de ejemplo.
La semilla borra y recrea todos los datos, así que no la ejecutes sobre una base con datos reales.

## Modelo de datos (`prisma/schema.prisma`)

- **Usuario**: nombre, email único, contraseña con bcrypt, rol (`usuario` | `admin`), avatar, bio.
- **Receta**: título, descripción, imagen, `videoUrl`, tiempos (total, preparación, cocción), dificultad,
  categoría, porciones, etiquetas, nutrición declarada por porción, media y número de valoraciones
  (denormalizados), autor, publicada.
- **Paso**: pasos ordenados de la receta (título, descripción, minutos, consejo).
- **Alimento**: tabla de referencia con valores por 100 g/ml: calorías, proteínas, carbohidratos,
  grasas, grasas saturadas, fibra, azúcares y sal. Categoría y unidad base (`g` | `ml`).
- **RecetaIngrediente**: ingrediente de una receta con cantidad, unidad y nota; puede enlazar con un
  Alimento para calcular la nutrición real de la receta.
- **Favorito** y **Valoracion** (1–5 estrellas + comentario, una por usuario y receta).

## Autenticación

JWT tipo Bearer. Registro o login devuelven `{ token, usuario }`; el frontend envía
`Authorization: Bearer <token>` en cada petición. El token caduca a los 7 días.

## Endpoints (`/api`)

| Método | Ruta                            | Auth       | Descripción                                        |
| ------ | ------------------------------- | ---------- | -------------------------------------------------- |
| GET    | `/salud`                        | –          | Comprobación de vida                               |
| GET    | `/estadisticas`                 | –          | Totales de recetas, alimentos, usuarios y valoración media |
| POST   | `/auth/registro`                | –          | Crear cuenta `{ nombre, email, password }`         |
| POST   | `/auth/login`                   | –          | Iniciar sesión `{ email, password }`               |
| GET    | `/auth/yo`                      | usuario    | Usuario actual con contadores                      |
| GET    | `/usuarios/:id`                 | opcional   | Perfil público y sus recetas publicadas            |
| PATCH  | `/usuarios/yo`                  | usuario    | Editar nombre, bio, avatar o contraseña            |
| GET    | `/recetas`                      | opcional   | Listado paginado con filtros (ver abajo)           |
| GET    | `/recetas/categorias`           | –          | Categorías con número de recetas                   |
| GET    | `/recetas/etiquetas`            | –          | Etiquetas con número de recetas                    |
| GET    | `/recetas/dificultades`         | –          | `["Fácil","Medio","Difícil"]`                      |
| GET    | `/recetas/mias`                 | usuario    | Mis recetas, incluidas las no publicadas           |
| GET    | `/recetas/favoritas`            | usuario    | Mis recetas favoritas                              |
| GET    | `/recetas/:id`                  | opcional   | Detalle completo (ingredientes, pasos, nutrición…) |
| POST   | `/recetas`                      | usuario    | Crear receta                                       |
| PUT    | `/recetas/:id`                  | autor/admin| Actualizar receta                                  |
| DELETE | `/recetas/:id`                  | autor/admin| Borrar receta                                      |
| POST   | `/recetas/:id/favorito`         | usuario    | Alternar favorito                                  |
| PUT    | `/recetas/:id/valoracion`       | usuario    | Crear o actualizar valoración `{ puntuacion, comentario }` |
| DELETE | `/recetas/:id/valoracion`       | usuario    | Quitar mi valoración                               |
| GET    | `/alimentos`                    | –          | Tabla paginada `?q=&categoria=&orden=&page=&limit=` |
| GET    | `/alimentos/categorias`         | –          | Categorías de alimentos con conteo                 |
| GET    | `/alimentos/:id`                | –          | Alimento y recetas que lo usan                     |
| POST   | `/alimentos`                    | usuario    | Añadir alimento                                    |
| PUT    | `/alimentos/:id`                | admin      | Editar alimento                                    |
| DELETE | `/alimentos/:id`                | admin      | Borrar alimento                                    |

### Filtros de `GET /recetas`

`q` (texto en título, descripción, etiquetas, categoría o ingredientes), `categoria`, `dificultad`,
`etiqueta`, `autorId`, `tiempoHasta` y `tiempoMasDe` (minutos), `orden`
(`recientes` | `valoracion` | `tiempo` | `populares`), `page`, `limit` (máx. 50).

Respuesta: `{ datos: [...], total, page, limit, totalPaginas }`.

### Cuerpo de `POST /recetas` y `PUT /recetas/:id`

```json
{
  "titulo": "Tortilla de patatas",
  "descripcion": "La de siempre, jugosa por dentro.",
  "imagenUrl": "https://...",
  "videoUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "tiempoTotal": 35, "tiempoPreparacion": 15, "tiempoCoccion": 20,
  "dificultad": "Fácil", "categoria": "Española", "porciones": 4,
  "etiquetas": ["Española", "Tradicional"],
  "calorias": 320, "proteinas": 12, "carbohidratos": 24, "grasas": 18,
  "publicada": true,
  "ingredientes": [
    { "nombre": "Patata", "cantidad": 600, "unidad": "g", "alimentoId": 20 },
    { "nombre": "Huevos", "cantidad": 6, "unidad": "unidades", "alimentoId": 60 },
    { "nombre": "Sal", "unidad": "al gusto" }
  ],
  "pasos": [
    { "titulo": "Pochar", "descripcion": "Fríe la patata a fuego suave.", "tiempoMin": 20 },
    { "descripcion": "Mezcla con el huevo batido y cuaja en la sartén.", "tiempoMin": 8 }
  ]
}
```

El detalle de una receta incluye `videoEmbedUrl` (YouTube/Vimeo listos para un `<iframe>`),
`nutricion` (declarada) y `nutricionCalculada` (suma de los alimentos enlazados con cantidad en g/ml,
cucharadas, tazas…).

Errores: `{ "error": "mensaje", "detalles": [{ "campo", "mensaje" }] }` con el código HTTP adecuado
(400 validación, 401 sin sesión, 403 sin permisos, 404 no encontrado, 409 duplicado).

## Cambiar a MySQL o PostgreSQL

1. En `prisma/schema.prisma` cambia `provider = "sqlite"` por `"mysql"` o `"postgresql"`.
2. En `.env` pon la URL, por ejemplo `DATABASE_URL="mysql://usuario:clave@localhost:3306/serenity"`.
3. Borra la carpeta `prisma/migrations` y ejecuta `npx prisma migrate dev --name init` y `npm run db:seed`.
