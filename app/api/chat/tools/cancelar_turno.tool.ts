import { prisma } from "@/lib/prisma"
import { cambiarEstadoTurno } from "@/lib/actions/turnos"

export const cancelarTurnoTool = {
  type: "function" as const,
  function: {
    name: "cancelar_turno",
    description: `Cancela un turno existente en la agenda del profesional. El profesional debe proporcionar el nombre del paciente y la fecha del turno. Usala cuando el profesional pida cancelar un turno, como "cancelá el turno de Juan para mañana", "dá de baja el turno de María del lunes", "eliminá el turno de las 10 de Pedro".`,
    parameters: {
      type: "object",
      properties: {
        paciente_nombre: {
          type: "string",
          description: "Nombre del paciente del turno a cancelar.",
        },
        fecha: {
          type: "string",
          description: "Fecha del turno a cancelar en formato YYYY-MM-DD.",
        },
      },
      required: ["paciente_nombre", "fecha"],
      additionalProperties: false,
    },
  },

  validate: async (args: { paciente_nombre: string; fecha: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) return { esValido: false, mensaje: "Profesional no encontrado." }

    const fechaDate = new Date(args.fecha + "T00:00:00")

    const pacientes = await prisma.paciente.findMany({
      where: {
        profesionalId: profesional.id,
        activo: true,
        nombre: { contains: args.paciente_nombre, mode: "insensitive" },
      },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })

    if (pacientes.length === 0) {
      return { esValido: false, mensaje: `No se encontró ningún paciente con el nombre "${args.paciente_nombre}".` }
    }

    if (pacientes.length > 1) {
      return {
        esValido: false,
        mensaje: `Hay ${pacientes.length} pacientes con nombre similar a "${args.paciente_nombre}":`,
        pacientesSimilares: pacientes.map((p) => ({ id: p.id, nombre: p.nombre })),
      }
    }

    const paciente = pacientes[0]

    const turnos = await prisma.turno.findMany({
      where: {
        profesionalId: profesional.id,
        pacienteId: paciente.id,
        fecha: fechaDate,
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
      },
      select: {
        id: true,
        horaInicio: true,
        horaFin: true,
        estado: true,
      },
      orderBy: { horaInicio: "asc" },
    })

    if (turnos.length === 0) {
      return {
        esValido: false,
        mensaje: `No se encontraron turnos activos para ${paciente.nombre} el ${args.fecha}.`,
      }
    }

    if (turnos.length > 1) {
      return {
        esValido: false,
        mensaje: `Se encontraron ${turnos.length} turnos para ${paciente.nombre} el ${args.fecha}:`,
        turnosMultiples: turnos.map((t) => ({
          id: t.id,
          horaInicio: t.horaInicio,
          horaFin: t.horaFin,
          estado: t.estado,
        })),
      }
    }

    const turno = turnos[0]

    return {
      esValido: true,
      _atencion: "SOLO VALIDACIÓN — el turno NO ha sido cancelado. No informes que ya está cancelado.",
      mensaje: "TURNO ENCONTRADO. Pendiente de confirmación del profesional para cancelar.",
      detalle: {
        accion: "cancelar_turno",
        turnoId: turno.id,
        paciente: { nombre: paciente.nombre },
        fecha: args.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        estadoActual: turno.estado,
        estadoFinal: "NO CANCELADO aún — esperando confirmación",
      },
    }
  },

  execute: async (args: { paciente_nombre: string; fecha: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) throw new Error("Profesional no encontrado")

    const fechaDate = new Date(args.fecha + "T00:00:00")

    const paciente = await prisma.paciente.findFirst({
      where: {
        profesionalId: profesional.id,
        activo: true,
        nombre: { contains: args.paciente_nombre, mode: "insensitive" },
      },
      select: { id: true, nombre: true },
    })
    if (!paciente) throw new Error(`Paciente "${args.paciente_nombre}" no encontrado.`)

    const turno = await prisma.turno.findFirst({
      where: {
        profesionalId: profesional.id,
        pacienteId: paciente.id,
        fecha: fechaDate,
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
      },
      select: { id: true, horaInicio: true },
      orderBy: { horaInicio: "asc" },
    })
    if (!turno) throw new Error(`No se encontró un turno activo para ${paciente.nombre} el ${args.fecha}.`)

    return cambiarEstadoTurno(turno.id, "CANCELADO").then(() => ({
      mensaje: `Turno de ${paciente.nombre} el ${args.fecha} a las ${turno.horaInicio} cancelado exitosamente.`,
      turnoId: turno.id,
      estado: "CANCELADO",
    }))
  },
}
