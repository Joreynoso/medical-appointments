import { prisma } from "@/lib/prisma"

function generarSlots(desde: string, hasta: string, duracion: number): string[] {
  const slots: string[] = []
  let [h, m] = desde.split(":").map(Number)
  const hastaMin = hasta.split(":").map(Number)
  const inicioMin = h * 60 + m
  const finMin = hastaMin[0] * 60 + hastaMin[1]

  let actual = inicioMin
  while (actual + duracion <= finMin) {
    const hh = Math.floor(actual / 60)
    const mm = actual % 60
    slots.push(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`)
    actual += duracion
  }

  return slots
}

export const consultarDisponibilidadTool = {
  type: "function" as const,
  function: {
    name: "consultar_disponibilidad",
    description: `Consulta los horarios libres (slots disponibles) para una fecha específica. Úsala cuando el profesional pregunte por disponibilidad, como "hay lugar mañana?", "qué horarios libres hay?", "hay algún slot el viernes a las 10?".`,
    parameters: {
      type: "object",
      properties: {
        fecha: {
          type: "string",
          description: "Fecha a consultar en formato YYYY-MM-DD. Si no se especifica, usa la fecha de hoy.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },

  execute: async (args: { fecha?: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
      include: { configuracion: true },
    })
    if (!profesional) throw new Error("Profesional no encontrado")
    if (!profesional.configuracion) throw new Error("No hay configuración de horario.")

    const config = profesional.configuracion
    const fechaStr = args.fecha ?? new Date().toISOString().slice(0, 10)
    const fechaDate = new Date(fechaStr + "T00:00:00")

    const diaSemana = fechaDate.getDay()

    if (diaSemana === 0) {
      return { mensaje: "Los domingos no hay atención. No hay disponibilidad.", disponibles: [] }
    }

    if (!config.diasLaborables.includes(diaSemana)) {
      return { mensaje: "Es un día no laborable. No hay disponibilidad.", disponibles: [] }
    }

    const feriado = await prisma.feriado.findUnique({
      where: { fecha: fechaDate },
    })
    if (feriado) {
      return { mensaje: `Es feriado (${feriado.nombre}). No hay atención.`, disponibles: [] }
    }

    const todosLosSlots = generarSlots(config.horarioDesde, config.horarioHasta, config.duracionSlot)

    if (todosLosSlots.length === 0) {
      return { mensaje: `No hay slots definidos para este horario (${config.horarioDesde} a ${config.horarioHasta}).`, disponibles: [] }
    }

    const ocupados = await prisma.turno.findMany({
      where: {
        profesionalId: profesional.id,
        fecha: fechaDate,
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
      },
      select: { horaInicio: true },
    })

    const ocupadosSet = new Set(ocupados.map((t) => t.horaInicio))
    const disponibles = todosLosSlots.filter((s) => !ocupadosSet.has(s))

    return {
      mensaje: `Slots disponibles para ${fechaStr}: ${disponibles.length} de ${todosLosSlots.length}`,
      fecha: fechaStr,
      disponibles,
      totalSlots: todosLosSlots.length,
    }
  },
}
