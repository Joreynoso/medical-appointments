import { prisma } from "@/lib/prisma"
import { buscarPacientesPorNombre } from "@/lib/paciente-search"

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number)
  const total = h * 60 + m + minutos
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

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

function formatearTurnosLista(turnos: Array<{ fecha: string; horaInicio: string; horaFin: string; estado: string; paciente: string }>): string {
  const fechasUnicas = [...new Set(turnos.map((t) => t.fecha))]
  const titulo = fechasUnicas.length === 1
    ? `📅 Turnos de ${formatearFecha(new Date(fechasUnicas[0] + "T00:00:00"))}`
    : "📅 Turnos encontrados"
  const lineas = turnos.map(
    (t) => {
      const fecha = fechasUnicas.length > 1 ? ` ${t.fecha.slice(8, 10)}/${t.fecha.slice(5, 7)} —` : ""
      return `- **${t.paciente}**${fecha} (${t.horaInicio} - ${t.horaFin}) — ${badgeEstado(t.estado)}`
    },
  )
  return [
    titulo,
    "",
    `Total: **${turnos.length}** turno(s)`,
    "",
    ...lineas,
  ].join("\n")
}

export const buscarTurnosTool = {
  type: "function" as const,
  function: {
    name: "buscar_turnos",
    description: `Busca turnos agendados del profesional. Úsala cuando el profesional pregunte por turnos específicos, como "qué turnos tengo hoy", "mostrame la agenda de mañana", "quién viene el lunes", "turnos de Juan", o "dame los confirmados". Si no se especifica una fecha, busca desde hoy en adelante.`,
    parameters: {
      type: "object",
      properties: {
        fecha_desde: {
          type: "string",
          description: "Fecha de inicio en formato YYYY-MM-DD. Si no se especifica, usa la fecha de hoy.",
        },
        fecha_hasta: {
          type: "string",
          description: "Fecha de fin en formato YYYY-MM-DD. Si no se especifica, busca solo en fecha_desde.",
        },
        paciente: {
          type: "string",
          description: "Nombre del paciente a buscar (búsqueda parcial, sin distinguir mayúsculas ni acentos).",
          maxLength: 70,
        },
        estado: {
          type: "string",
          description: "Filtrar por estado del turno: PENDIENTE, CONFIRMADO, CANCELADO, AUSENTE.",
          enum: ["PENDIENTE", "CONFIRMADO", "CANCELADO", "AUSENTE"],
        },
      },
      required: [],
      additionalProperties: false,
    },
  },

  execute: async (args: { fecha_desde?: string; fecha_hasta?: string; paciente?: string; estado?: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) throw new Error("Profesional no encontrado")

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const desde = args.fecha_desde
      ? new Date(args.fecha_desde + "T00:00:00")
      : hoy

    const hasta = args.fecha_hasta
      ? new Date(args.fecha_hasta + "T23:59:59")
      : args.fecha_desde
        ? new Date(args.fecha_desde + "T23:59:59")
        : new Date(hoy.getTime() + 6 * 24 * 60 * 60 * 1000)

    const where: any = {
      profesionalId: profesional.id,
      fecha: { gte: desde, lte: hasta },
    }

    if (args.paciente) {
      const pacientes = await buscarPacientesPorNombre(profesional.id, args.paciente)
      if (pacientes.length === 0) {
        return { mensaje: `No se encontraron turnos para paciente "${args.paciente}".`, turnos: [] }
      }
      where.pacienteId = { in: pacientes.map((p) => p.id) }
    }

    if (args.estado) {
      where.estado = args.estado
    }

    const turnos = await prisma.turno.findMany({
      where,
      select: {
        id: true,
        fecha: true,
        horaInicio: true,
        horaFin: true,
        estado: true,
        paciente: {
          select: { id: true, nombre: true, telefono: true },
        },
      },
      orderBy: [
        { fecha: "asc" },
        { horaInicio: "asc" },
      ],
    })

    if (turnos.length === 0) {
      const rango =
        args.fecha_desde || args.fecha_hasta
          ? `del ${args.fecha_desde ?? "hoy"} al ${args.fecha_hasta ?? args.fecha_desde ?? "próximos días"}`
          : "hoy y próximos días"
      return { formattedMessage: `No se encontraron turnos ${rango}.` }
    }

    const turnosData = turnos.map((t) => ({
      fecha: t.fecha.toISOString().slice(0, 10),
      horaInicio: t.horaInicio,
      horaFin: t.horaFin,
      estado: t.estado,
      paciente: t.paciente.nombre,
    }))

    return {
      formattedMessage: formatearTurnosLista(turnosData),
    }
  },
}
