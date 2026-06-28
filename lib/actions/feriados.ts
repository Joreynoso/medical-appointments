"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { getYearRange, sincronizarSiEsNecesario } from "@/lib/feriados"

type FeriadoData = Prisma.FeriadoGetPayload<{ select: { fecha: true; nombre: true } }>

export const getFeriadosEnRango = cache(async (año: number) => {
  await sincronizarSiEsNecesario()

  const feriados: FeriadoData[] = await prisma.feriado.findMany({
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
