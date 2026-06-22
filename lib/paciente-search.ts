import { prisma } from "@/lib/prisma"

type PacienteResult = { id: string; nombre: string; telefono: string | null }

export async function buscarPacientesPorNombre(
  profesionalId: string,
  search: string,
): Promise<PacienteResult[]> {
  const words = search.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const patterns = words.map((w) => `%${w.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}%`)

  return prisma.$queryRaw<PacienteResult[]>`
    SELECT id, nombre, telefono
    FROM "Paciente"
    WHERE "profesionalId" = ${profesionalId}::text
      AND activo = true
      AND unaccent(nombre) ILIKE ALL (ARRAY[${patterns}]::text[])
    ORDER BY nombre ASC
  `
}
