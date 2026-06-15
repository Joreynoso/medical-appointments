-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "obraSocialId" TEXT;

-- CreateTable
CREATE TABLE "ObraSocial" (
    "id" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObraSocial_profesionalId_nombre_key" ON "ObraSocial"("profesionalId", "nombre");

-- AddForeignKey
ALTER TABLE "ObraSocial" ADD CONSTRAINT "ObraSocial_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
