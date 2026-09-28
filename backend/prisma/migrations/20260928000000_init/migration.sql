-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receta" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "videoUrl" TEXT,
    "tiempoTotal" INTEGER NOT NULL,
    "tiempoPreparacion" INTEGER,
    "tiempoCoccion" INTEGER,
    "dificultad" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "porciones" INTEGER NOT NULL DEFAULT 4,
    "etiquetas" TEXT NOT NULL DEFAULT '[]',
    "calorias" INTEGER,
    "proteinas" DOUBLE PRECISION,
    "carbohidratos" DOUBLE PRECISION,
    "grasas" DOUBLE PRECISION,
    "fibra" DOUBLE PRECISION,
    "azucares" DOUBLE PRECISION,
    "sodio" DOUBLE PRECISION,
    "valoracionMedia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numValoraciones" INTEGER NOT NULL DEFAULT 0,
    "publicada" BOOLEAN NOT NULL DEFAULT true,
    "autorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paso" (
    "id" SERIAL NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT,
    "descripcion" TEXT NOT NULL,
    "tiempoMin" INTEGER,
    "consejo" TEXT,

    CONSTRAINT "Paso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alimento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidadBase" TEXT NOT NULL DEFAULT 'g',
    "calorias" DOUBLE PRECISION NOT NULL,
    "proteinas" DOUBLE PRECISION NOT NULL,
    "carbohidratos" DOUBLE PRECISION NOT NULL,
    "grasas" DOUBLE PRECISION NOT NULL,
    "grasasSaturadas" DOUBLE PRECISION,
    "fibra" DOUBLE PRECISION,
    "azucares" DOUBLE PRECISION,
    "sal" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecetaIngrediente" (
    "id" SERIAL NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "alimentoId" INTEGER,
    "nombre" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION,
    "unidad" TEXT,
    "nota" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecetaIngrediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "usuarioId" INTEGER NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("usuarioId","recetaId")
);

-- CreateTable
CREATE TABLE "Valoracion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Valoracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Receta_categoria_idx" ON "Receta"("categoria");

-- CreateIndex
CREATE INDEX "Receta_dificultad_idx" ON "Receta"("dificultad");

-- CreateIndex
CREATE INDEX "Receta_autorId_idx" ON "Receta"("autorId");

-- CreateIndex
CREATE INDEX "Receta_publicada_creadoEn_idx" ON "Receta"("publicada", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "Paso_recetaId_orden_key" ON "Paso"("recetaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Alimento_nombre_key" ON "Alimento"("nombre");

-- CreateIndex
CREATE INDEX "Alimento_categoria_idx" ON "Alimento"("categoria");

-- CreateIndex
CREATE INDEX "RecetaIngrediente_recetaId_idx" ON "RecetaIngrediente"("recetaId");

-- CreateIndex
CREATE INDEX "RecetaIngrediente_alimentoId_idx" ON "RecetaIngrediente"("alimentoId");

-- CreateIndex
CREATE INDEX "Valoracion_recetaId_idx" ON "Valoracion"("recetaId");

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_usuarioId_recetaId_key" ON "Valoracion"("usuarioId", "recetaId");

-- AddForeignKey
ALTER TABLE "Receta" ADD CONSTRAINT "Receta_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paso" ADD CONSTRAINT "Paso_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetaIngrediente" ADD CONSTRAINT "RecetaIngrediente_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetaIngrediente" ADD CONSTRAINT "RecetaIngrediente_alimentoId_fkey" FOREIGN KEY ("alimentoId") REFERENCES "Alimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "Receta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

