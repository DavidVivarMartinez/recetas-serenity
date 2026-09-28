-- AlterTable
ALTER TABLE "Receta" ADD COLUMN     "fuente" TEXT,
ADD COLUMN     "fuenteId" TEXT,
ADD COLUMN     "fuenteUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Receta_fuente_fuenteId_key" ON "Receta"("fuente", "fuenteId");

