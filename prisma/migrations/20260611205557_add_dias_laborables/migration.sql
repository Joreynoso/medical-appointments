-- AlterTable
ALTER TABLE "ConfiguracionProfesional" ADD COLUMN     "diasLaborables" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6]::INTEGER[];
