"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"
import { revalidatePath } from "next/cache"

export type TurnoData = {
  id: string
  fecha: string
  horaInicio: string
  horaFin: string
  estado: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "AUSENTE"
  paciente: {
    id: string
    nombre: string
    telefono: string | null
    notas: string | null
  }
}

export async function cambiarEstadoTurno(
  turnoId: string,
  nuevoEstado: "CONFIRMADO" | "CANCELADO" | "AUSENTE",
) {
  const profesional = await getCurrentProfesional()

  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: { estado: true, profesionalId: true },
  })

  if (!turno) throw new Error("Turno no encontrado")
  if (turno.profesionalId !== profesional.id) throw new Error("No autorizado")

  const transiciones: Record<string, string[]> = {
    PENDIENTE: ["CONFIRMADO", "CANCELADO"],
    CONFIRMADO: ["CANCELADO", "AUSENTE"],
    CANCELADO: ["CONFIRMADO"],
    AUSENTE: ["CONFIRMADO"],
  }

  const permitidos = transiciones[turno.estado]
  if (!permitidos?.includes(nuevoEstado)) {
    throw new Error(`No se puede cambiar el estado de "${turno.estado}" a "${nuevoEstado}"`)
  }

  await prisma.turno.update({
    where: { id: turnoId },
    data: { estado: nuevoEstado },
  })

  revalidatePath("/dashboard/agenda")
}

export const getTurnosEnRango = cache(async (desde: string, hasta: string): Promise<TurnoData[]> => {
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
        select: { id: true, nombre: true, telefono: true, notas: true },
      },
    },
    orderBy: { horaInicio: "asc" },
  })

  return turnos.map((t) => ({
    ...t,
    fecha: t.fecha.toISOString().slice(0, 10),
  }))
})

export type ConfigHoraria = {
  horarioDesde: string
  horarioHasta: string
  duracionSlot: number
  diasLaborables: number[]
}

export async function getConfiguracionHoraria(): Promise<ConfigHoraria> {
  const profesional = await getCurrentProfesional()
  if (!profesional.configuracion) throw new Error("No hay configuración de horario.")
  return {
    horarioDesde: profesional.configuracion.horarioDesde,
    horarioHasta: profesional.configuracion.horarioHasta,
    duracionSlot: profesional.configuracion.duracionSlot,
    diasLaborables: profesional.configuracion.diasLaborables,
  }
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number)
  const total = h * 60 + m + minutos
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

type CrearTurnoInput = {
  fecha: string
  horaInicio: string
  pacienteId: string
}

export async function crearTurno(input: CrearTurnoInput) {
  const profesional = await getCurrentProfesional()
  const config = profesional.configuracion
  if (!config) throw new Error("No hay configuración de horario. Configurá tu disponibilidad primero.")

  const fechaDate = new Date(input.fecha + "T00:00:00")

  const diaSemana = fechaDate.getDay()
  if (diaSemana === 0) throw new Error("No se pueden crear turnos los domingos.")
  if (!config.diasLaborables.includes(diaSemana)) throw new Error("No se pueden crear turnos en días no laborables.")

  const feriado = await prisma.feriado.findUnique({
    where: { fecha: fechaDate },
  })
  if (feriado) throw new Error(`No se pueden crear turnos en feriados (${feriado.nombre}).`)

  if (input.fecha < new Date().toISOString().slice(0, 10)) {
    throw new Error("No se pueden crear turnos en el pasado.")
  }

  if (input.horaInicio < config.horarioDesde) throw new Error(`El horario de atención comienza a las ${config.horarioDesde}.`)

  const horaFin = sumarMinutos(input.horaInicio, config.duracionSlot)
  if (horaFin > config.horarioHasta) throw new Error(`El turno excede el horario de atención (hasta las ${config.horarioHasta}).`)

  const turnoExistente = await prisma.turno.findFirst({
    where: {
      profesionalId: profesional.id,
      fecha: fechaDate,
      horaInicio: { lt: horaFin },
      horaFin: { gt: input.horaInicio },
      estado: { notIn: ["CANCELADO", "AUSENTE"] },
    },
  })
  if (turnoExistente) throw new Error("Ya existe un turno en ese horario.")

  const turno = await prisma.turno.create({
    data: {
      profesionalId: profesional.id,
      pacienteId: input.pacienteId,
      fecha: fechaDate,
      horaInicio: input.horaInicio,
      horaFin,
      estado: "PENDIENTE",
    },
    select: {
      id: true,
      fecha: true,
      horaInicio: true,
      horaFin: true,
      estado: true,
      paciente: { select: { id: true, nombre: true, telefono: true, notas: true } },
    },
  })

  revalidatePath("/dashboard/agenda")

  return {
    ...turno,
    fecha: turno.fecha.toISOString().slice(0, 10),
  }
}

export async function getSlotsOcupadosEnFecha(fecha: string): Promise<string[]> {
  const profesional = await getCurrentProfesional()
  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: new Date(fecha + "T00:00:00"),
      estado: { in: ["PENDIENTE", "CONFIRMADO"] },
    },
    select: { horaInicio: true },
  })
  return turnos.map((t) => t.horaInicio)
}
