import { prisma } from "@/lib/prisma"
import { crearTurno } from "@/lib/actions/turnos"

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number)
  const total = h * 60 + m + minutos
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

export const crearTurnoTool = {
  type: "function" as const,
  function: {
    name: "crear_turno",
    description: `Crea un nuevo turno para un paciente en la agenda del profesional. El profesional debe proporcionar el nombre del paciente, la fecha y la hora de inicio. Usala cuando el profesional pida agendar o crear un turno, como "agendá un turno para Juan mañana a las 10", "creá un turno para María el lunes a las 15:30", "dáme un turno para Pedro".`,
    parameters: {
      type: "object",
      properties: {
        paciente_nombre: {
          type: "string",
          description: "Nombre del paciente a buscar.",
        },
        fecha: {
          type: "string",
          description: "Fecha del turno en formato YYYY-MM-DD.",
        },
        hora: {
          type: "string",
          description: "Hora de inicio del turno en formato HH:MM (24h).",
        },
      },
      required: ["paciente_nombre", "fecha", "hora"],
      additionalProperties: false,
    },
  },

  validate: async (args: { paciente_nombre: string; fecha: string; hora: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
      include: { configuracion: true },
    })
    if (!profesional) return { esValido: false, mensaje: "Profesional no encontrado." }
    if (!profesional.configuracion) return { esValido: false, mensaje: "No hay configuración de horario. Configurá tu disponibilidad primero." }

    const config = profesional.configuracion

    const pacientes = await prisma.paciente.findMany({
      where: {
        profesionalId: profesional.id,
        activo: true,
        nombre: { contains: args.paciente_nombre, mode: "insensitive" },
      },
      select: { id: true, nombre: true, telefono: true },
      orderBy: { nombre: "asc" },
    })

    if (pacientes.length === 0) {
      return {
        esValido: false,
        mensaje: `No se encontró ningún paciente con el nombre "${args.paciente_nombre}".`,
        pacientesSimilares: [],
      }
    }

    if (pacientes.length > 1) {
      return {
        esValido: false,
        mensaje: `Se encontraron ${pacientes.length} pacientes con nombre similar a "${args.paciente_nombre}":`,
        pacientesSimilares: pacientes.map((p) => ({ id: p.id, nombre: p.nombre })),
      }
    }

    const paciente = pacientes[0]

    const fechaDate = new Date(args.fecha + "T00:00:00")

    const diaSemana = fechaDate.getDay()
    if (diaSemana === 0) return { esValido: false, mensaje: "No se pueden crear turnos los domingos (día no laborable)." }
    if (!config.diasLaborables.includes(diaSemana)) return { esValido: false, mensaje: "Ese día no es laborable según la configuración." }

    const feriado = await prisma.feriado.findUnique({ where: { fecha: fechaDate } })
    if (feriado) return { esValido: false, mensaje: `Es feriado (${feriado.nombre}). No se pueden crear turnos.` }

    const hoyStr = new Date().toISOString().slice(0, 10)
    if (args.fecha < hoyStr) return { esValido: false, mensaje: "No se pueden crear turnos en el pasado." }

    if (args.hora < config.horarioDesde) return { esValido: false, mensaje: `El horario de atención comienza a las ${config.horarioDesde}.` }

    const horaFin = sumarMinutos(args.hora, config.duracionSlot)
    if (horaFin > config.horarioHasta) return { esValido: false, mensaje: `El turno excede el horario de atención (cierra a las ${config.horarioHasta}).` }

    const turnoExistente = await prisma.turno.findFirst({
      where: {
        profesionalId: profesional.id,
        fecha: fechaDate,
        horaInicio: { lt: horaFin },
        horaFin: { gt: args.hora },
        estado: { notIn: ["CANCELADO", "AUSENTE"] },
      },
    })
    if (turnoExistente) return { esValido: false, mensaje: `Ya existe un turno de ${turnoExistente.horaInicio} a ${turnoExistente.horaFin} en ese horario.` }

    return {
      esValido: true,
      _atencion: "SOLO VALIDACIÓN — el turno NO ha sido creado. No informes que ya está creado.",
      mensaje: "SLOT DISPONIBLE. Pendiente de confirmación del profesional para crear el turno.",
      detalle: {
        accion: "crear_turno",
        paciente: { id: paciente.id, nombre: paciente.nombre, telefono: paciente.telefono },
        fecha: args.fecha,
        horaInicio: args.hora,
        horaFin,
        duracion: config.duracionSlot,
        estadoFinal: "NO CREADO aún — esperando confirmación",
      },
    }
  },

  execute: async (args: { paciente_nombre: string; fecha: string; hora: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) throw new Error("Profesional no encontrado")

    const paciente = await prisma.paciente.findFirst({
      where: {
        profesionalId: profesional.id,
        activo: true,
        nombre: { contains: args.paciente_nombre, mode: "insensitive" },
      },
      select: { id: true, nombre: true },
    })
    if (!paciente) throw new Error(`Paciente "${args.paciente_nombre}" no encontrado.`)

    return crearTurno({
      fecha: args.fecha,
      horaInicio: args.hora,
      pacienteId: paciente.id,
    })
  },
}
