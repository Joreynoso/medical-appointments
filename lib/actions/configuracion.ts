"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"
import { revalidatePath } from "next/cache"

export type ConfiguracionData = {
  duracionSlot: number
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
}

export async function getConfiguracion(): Promise<ConfiguracionData | null> {
  const profesional = await getCurrentProfesional()
  if (!profesional.configuracion) return null
  return {
    duracionSlot: profesional.configuracion.duracionSlot,
    horarioDesde: profesional.configuracion.horarioDesde,
    horarioHasta: profesional.configuracion.horarioHasta,
    diasLaborables: profesional.configuracion.diasLaborables,
  }
}

type ActualizarConfiguracionInput = {
  duracionSlot: number
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
}

export async function actualizarConfiguracion(input: ActualizarConfiguracionInput) {
  const profesional = await getCurrentProfesional()
  const configActual = profesional.configuracion

  if (input.duracionSlot < 10 || input.duracionSlot > 120) {
    throw new Error("La duración del slot debe estar entre 10 y 120 minutos.")
  }

  const [hDesde, mDesde] = input.horarioDesde.split(":").map(Number)
  const [hHasta, mHasta] = input.horarioHasta.split(":").map(Number)
  if (hDesde * 60 + mDesde >= hHasta * 60 + mHasta) {
    throw new Error("El horario de inicio debe ser anterior al horario de fin.")
  }

  if (input.diasLaborables.includes(0)) {
    throw new Error("Los domingos no pueden configurarse como día laborable.")
  }

  if (input.diasLaborables.length === 0) {
    throw new Error("Debe seleccionar al menos un día laborable.")
  }

  const unicos = [...new Set(input.diasLaborables)].sort()
  if (unicos.some((d) => d < 1 || d > 6)) {
    throw new Error("Días laborables inválidos.")
  }

  if (configActual && configActual.duracionSlot !== input.duracionSlot) {
    const turnosFuturos = await prisma.turno.count({
      where: {
        profesionalId: profesional.id,
        fecha: { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00") },
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
      },
    })
    if (turnosFuturos > 0) {
      throw new Error(
        "No se puede cambiar la duración del slot porque hay turnos pendientes o confirmados a futuro. Cancelá o reprogramá los turnos antes de cambiar la duración."
      )
    }
  }

  if (configActual) {
    const turnosFueraRango = await prisma.turno.count({
      where: {
        profesionalId: profesional.id,
        fecha: { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00") },
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
        OR: [
          { horaInicio: { lt: input.horarioDesde } },
          { horaFin: { gt: input.horarioHasta } },
        ],
      },
    })
    if (turnosFueraRango > 0) {
      throw new Error(
        "El nuevo rango horario deja turnos existentes fuera del horario de atención. Cancelá o reprogramá esos turnos antes de cambiar el horario."
      )
    }
  }

  await prisma.configuracionProfesional.upsert({
    where: { profesionalId: profesional.id },
    update: {
      duracionSlot: input.duracionSlot,
      horarioDesde: input.horarioDesde,
      horarioHasta: input.horarioHasta,
      diasLaborables: input.diasLaborables,
    },
    create: {
      profesionalId: profesional.id,
      duracionSlot: input.duracionSlot,
      horarioDesde: input.horarioDesde,
      horarioHasta: input.horarioHasta,
      diasLaborables: input.diasLaborables,
    },
  })

  revalidatePath("/dashboard/agenda")
  revalidatePath("/dashboard/configuracion")
}
