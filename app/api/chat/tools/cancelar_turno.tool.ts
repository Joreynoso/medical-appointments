import { prisma } from "@/lib/prisma"
import { cambiarEstadoTurno } from "@/lib/actions/turnos"
import { buscarPacientesPorNombre } from "@/lib/paciente-search"

export const cancelarTurnoTool = {
  type: "function" as const,
  function: {
    name: "cancelar_turno",
    description: `Cancela un turno existente en la agenda del profesional. El profesional debe proporcionar el nombre del paciente. Si también especifica la fecha, se cancela ese turno directamente. Si no especifica fecha, se muestran todos los turnos activos del paciente para que elija. Usala cuando el profesional pida cancelar un turno, como "cancelá el turno de Juan", "dá de baja el turno de María", "eliminá el turno de las 10 de Pedro".`,
    parameters: {
      type: "object",
      properties: {
        paciente_nombre: {
          type: "string",
          description: "Nombre del paciente del turno a cancelar.",
        },
        fecha: {
          type: "string",
          description: "Fecha del turno a cancelar en formato YYYY-MM-DD. Opcional: si no se proporciona, se mostrarán todos los turnos activos del paciente para que el profesional elija.",
        },
      },
      required: ["paciente_nombre"],
      additionalProperties: false,
    },
  },

  validate: async (args: { paciente_nombre: string; fecha?: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) return { esValido: false, mensaje: "Profesional no encontrado." }

    const pacientes = await buscarPacientesPorNombre(profesional.id, args.paciente_nombre)

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

    if (!args.fecha) {
      // No date specified — list ALL active turnos for this patient
      const turnos = await prisma.turno.findMany({
        where: {
          profesionalId: profesional.id,
          pacienteId: paciente.id,
          estado: { in: ["PENDIENTE", "CONFIRMADO"] },
        },
        select: {
          id: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          estado: true,
        },
        orderBy: [
          { fecha: "asc" },
          { horaInicio: "asc" },
        ],
      })

      if (turnos.length === 0) {
        return {
          esValido: false,
          mensaje: `${paciente.nombre} no tiene turnos activos (pendientes o confirmados).`,
        }
      }

      return {
        esValido: false,
        mensaje: `Se encontraron ${turnos.length} turno(s) activo(s) para ${paciente.nombre}. Indicá cuál querés cancelar:`,
        turnosMultiples: turnos.map((t) => ({
          id: t.id,
          fecha: t.fecha.toISOString().slice(0, 10),
          horaInicio: t.horaInicio,
          horaFin: t.horaFin,
          estado: t.estado,
        })),
      }
    }

    // Date specified — filter by date
    const fechaDesde = new Date(args.fecha + "T00:00:00")
    const fechaHasta = new Date(args.fecha + "T23:59:59")

    const turnos = await prisma.turno.findMany({
      where: {
        profesionalId: profesional.id,
        pacienteId: paciente.id,
        fecha: { gte: fechaDesde, lte: fechaHasta },
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
          fecha: args.fecha,
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

  execute: async (args: { paciente_nombre: string; fecha?: string }, userId?: string) => {
    if (!args.fecha) {
      throw new Error("Debe especificar la fecha del turno a cancelar.")
    }

    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) throw new Error("Profesional no encontrado")

    const fechaDesde = new Date(args.fecha + "T00:00:00")
    const fechaHasta = new Date(args.fecha + "T23:59:59")

    const pacientes = await buscarPacientesPorNombre(profesional.id, args.paciente_nombre)
    if (pacientes.length === 0) throw new Error(`Paciente "${args.paciente_nombre}" no encontrado.`)
    const paciente = pacientes[0]

    const turno = await prisma.turno.findFirst({
      where: {
        profesionalId: profesional.id,
        pacienteId: paciente.id,
        fecha: { gte: fechaDesde, lte: fechaHasta },
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
