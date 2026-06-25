"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"
import { getYearRange } from "@/lib/feriados"

function formatearFecha(fecha: Date): string {
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`
}

function badgeEstado(estado: string): string {
  const map: Record<string, string> = {
    PENDIENTE: "🟡 Pendiente",
    CONFIRMADO: "🟢 Confirmado",
    CANCELADO: "🔴 Cancelado",
    AUSENTE: "🟠 Ausente",
  }
  return map[estado] ?? estado
}

export async function getResumenTurnosHoy(): Promise<string> {
  const profesional = await getCurrentProfesional()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const maniana = new Date(hoy)
  maniana.setDate(maniana.getDate() + 1)

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: { gte: hoy, lt: maniana },
      estado: { not: "CANCELADO" },
    },
    select: {
      horaInicio: true,
      horaFin: true,
      estado: true,
      paciente: { select: { nombre: true } },
    },
    orderBy: { horaInicio: "asc" },
  })

  if (turnos.length === 0) {
    return `**📅 ${formatearFecha(hoy)}**\n\nNo tenés turnos agendados para hoy.`
  }

  const lineas = turnos.map(
    (t) => `- **${t.paciente.nombre}** (${t.horaInicio} - ${t.horaFin}) — ${badgeEstado(t.estado)}`,
  )

  return [
    `📅 Turnos de ${formatearFecha(hoy)}`,
    "",
    `Total: **${turnos.length}** turno(s)`,
    "",
    ...lineas,
  ].join("\n")
}

export async function getResumenDisponibilidad(): Promise<string> {
  const profesional = await getCurrentProfesional()
  const config = profesional.configuracion
  if (!config) return "No hay configuración de horario. Configurá tu disponibilidad primero."

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaStr = hoy.toISOString().slice(0, 10)
  const diaSemana = hoy.getDay()

  if (diaSemana === 0) return "Hoy es domingo, no hay atención."

  if (!config.diasLaborables.includes(diaSemana)) {
    return "Hoy es un día no laborable según tu configuración."
  }

  const feriado = await prisma.feriado.findUnique({ where: { fecha: hoy } })
  if (feriado) return `Hoy es feriado (${feriado.nombre}), no hay atención.`

  const ocupados = await prisma.turno.findMany({
    where: {
      profesionalId: profesional.id,
      fecha: hoy,
      estado: { in: ["PENDIENTE", "CONFIRMADO"] },
    },
    select: { horaInicio: true },
  })
  const ocupadosSet = new Set(ocupados.map((t) => t.horaInicio))

  const duracion = config.duracionSlot
  const slots: string[] = []
  let [h, m] = config.horarioDesde.split(":").map(Number)
  const hasta = config.horarioHasta.split(":").map(Number)
  let actual = h * 60 + m
  const finMin = hasta[0] * 60 + hasta[1]

  while (actual + duracion <= finMin) {
    const hh = Math.floor(actual / 60)
    const mm = actual % 60
    const slot = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
    if (!ocupadosSet.has(slot)) {
      slots.push(slot)
    }
    actual += duracion
  }

  if (slots.length === 0) {
    return `**📋 Disponibilidad de ${formatearFecha(hoy)}**\n\nNo hay slots libres para hoy.`
  }

  const lineas = slots.map((s) => `- ${s} hs`)

  return [
    `**📋 Disponibilidad de ${formatearFecha(hoy)}**`,
    "",
    `Slots libres: **${slots.length}**`,
    "",
    ...lineas,
  ].join("\n")
}

export async function getResumenFeriados(): Promise<string> {
  const profesional = await getCurrentProfesional()
  const año = new Date().getFullYear()
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

  const feriados = await prisma.feriado.findMany({
    where: { fecha: getYearRange(año) },
    select: { fecha: true, nombre: true },
    orderBy: { fecha: "asc" },
  })

  if (feriados.length === 0) return `No hay feriados registrados para ${año}.`

  const lineas = feriados.map((f) => {
    const utcStr = f.fecha.toISOString().slice(0, 10)
    const [, m, d] = utcStr.split("-").map(Number)
    return `- **${d} de ${meses[m - 1]}** — ${f.nombre}`
  })

  return [
    `**📆 Feriados ${año}**`,
    "",
    `Total: **${feriados.length}** feriado(s)`,
    "",
    ...lineas,
  ].join("\n")
}
