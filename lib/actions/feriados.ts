"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getYearRange, sincronizarSiEsNecesario } from "@/lib/feriados"

export const getFeriadosEnRango = cache(async (año: number) => {
  await sincronizarSiEsNecesario()

  const feriados = await prisma.feriado.findMany({
    where: { fecha: getYearRange(año) },
    select: { fecha: true, nombre: true },
  })

  return feriados.map((f) => ({
    fecha: f.fecha.toISOString().slice(0, 10),
    nombre: f.nombre,
  }))
})

export async function sincronizarFeriados() {
  return sincronizarSiEsNecesario()
}
