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
    select: { estado: true, profesionalId: true, fecha: true },
  })

  if (!turno) throw new Error("Turno no encontrado")
  if (turno.profesionalId !== profesional.id) throw new Error("No autorizado")

  const transiciones: Record<string, string[]> = {
    PENDIENTE: ["CONFIRMADO", "CANCELADO", "AUSENTE"],
    CONFIRMADO: ["CANCELADO", "AUSENTE"],
    CANCELADO: ["CONFIRMADO"],
    AUSENTE: ["CONFIRMADO"],
  }

  const permitidos = transiciones[turno.estado]
  if (!permitidos?.includes(nuevoEstado)) {
    throw new Error(`No se puede cambiar el estado de "${turno.estado}" a "${nuevoEstado}"`)
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (turno.fecha < hoy && nuevoEstado === "CANCELADO") {
    throw new Error("No se puede cancelar un turno de una fecha pasada")
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

export type TurnosPorMesData = {
  mes: string
  total: number
}

export async function getTurnosPorMes(cantidadMeses = 6): Promise<TurnosPorMesData[]> {
  const profesional = await getCurrentProfesional()
  const ahora = new Date()
  const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - cantidadMeses + 1, 1)
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: { gte: inicio, lte: fin },
      estado: { not: "CANCELADO" },
    },
    select: { fecha: true },
  })

  const conteo: Record<string, number> = {}
  for (const t of turnos) {
    const key = `${t.fecha.getFullYear()}-${t.fecha.getMonth()}`
    conteo[key] = (conteo[key] || 0) + 1
  }

  const meses: TurnosPorMesData[] = []
  for (let i = cantidadMeses - 1; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`
    meses.push({
      mes: nombresMeses[fecha.getMonth()],
      total: conteo[key] ?? 0,
    })
  }

  return meses
}

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

export async function getTurnosHoy(): Promise<TurnoData[]> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const maniana = new Date(hoy)
  maniana.setDate(maniana.getDate() + 1)
  return getTurnosEnRango(
    hoy.toISOString().slice(0, 10),
    maniana.toISOString().slice(0, 10),
  )
}

export async function getProximosTurnos(limite = 10): Promise<TurnoData[]> {
  const profesional = await getCurrentProfesional()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: { gte: hoy },
      estado: { not: "CANCELADO" },
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
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    take: limite,
  })

  return turnos.map((t) => ({
    ...t,
    fecha: t.fecha.toISOString().slice(0, 10),
  }))
}
