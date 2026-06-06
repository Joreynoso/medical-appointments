"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"

export type TurnoData = {
  id: string
  fecha: string
  horaInicio: string
  horaFin: string
  estado: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "AUSENTE"
  paciente: {
    id: string
    nombre: string
  }
}

export async function getTurnosEnRango(desde: string, hasta: string): Promise<TurnoData[]> {
  const profesional = await getCurrentProfesional()

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: {
        gte: new Date(desde),
        lte: new Date(hasta),
      },
    },
    select: {
      id: true,
      fecha: true,
      horaInicio: true,
      horaFin: true,
      estado: true,
      paciente: {
        select: { id: true, nombre: true },
      },
    },
    orderBy: { horaInicio: "asc" },
  })

  return turnos.map((t) => ({
    ...t,
    fecha: t.fecha.toISOString().slice(0, 10),
  }))
}
