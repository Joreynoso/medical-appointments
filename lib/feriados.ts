import { cache } from "react"
import { prisma } from "@/lib/prisma"

interface FeriadoAPI {
  fecha: string
  nombre: string
}

export function getYearRange(año: number) {
  return {
    gte: new Date(`${año}-01-01T00:00:00.000Z`),
    lt: new Date(`${año + 1}-01-01T00:00:00.000Z`),
  }
}

export async function sincronizarFeriadosDesdeAPI(año: number) {
  const res = await fetch(
    `https://api.argentinadatos.com/v1/feriados/${año}`,
    { next: { revalidate: 86400 } }
  )

  if (!res.ok) {
    throw new Error(`Error al obtener feriados: ${res.status}`)
  }

  const feriados: FeriadoAPI[] = await res.json()

  for (const f of feriados) {
    await prisma.feriado.upsert({
      where: { fecha: new Date(f.fecha) },
      update: { nombre: f.nombre },
      create: { fecha: new Date(f.fecha), nombre: f.nombre },
    })
  }

  return feriados.length
}

export const sincronizarSiEsNecesario = cache(async () => {
  const año = new Date().getFullYear()

  const existentes = await prisma.feriado.count({
    where: { fecha: getYearRange(año) },
  })

  if (existentes > 0) {
    return { sincronizados: 0, yaCargados: true, año }
  }

  const sincronizados = await sincronizarFeriadosDesdeAPI(año)

  return { sincronizados, yaCargados: false, año }
})
