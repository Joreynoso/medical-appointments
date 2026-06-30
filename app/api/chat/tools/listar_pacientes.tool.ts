import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buscarPacientesPorNombre } from "@/lib/paciente-search"

type PacienteConOS = Prisma.PacienteGetPayload<{
  select: {
    id: true
    nombre: true
    telefono: true
    notas: true
    obraSocial: { select: { nombre: true } }
    createdAt: true
  }
}>

export const listarPacientesTool = {
  type: "function" as const,
  function: {
    name: "listar_pacientes",
    description: `Lista todos los pacientes activos del profesional. Úsala cuando el profesional pregunte por sus pacientes, como "mostrame mis pacientes", "quiénes son mis pacientes", "dame el listado de pacientes", "cuántos pacientes tengo".`,
    parameters: {
      type: "object",
      properties: {
        busqueda: {
          type: "string",
          description: "Texto de búsqueda para filtrar pacientes por nombre (coincidencia parcial, sin distinguir mayúsculas ni acentos). Opcional.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },

  execute: async (args: { busqueda?: string }, userId?: string) => {
    const profesional = await prisma.profesional.findUnique({
      where: { clerkId: userId },
    })
    if (!profesional) throw new Error("Profesional no encontrado")

    const where: Prisma.PacienteWhereInput = {
      profesionalId: profesional.id,
      activo: true,
    }

    if (args.busqueda) {
      const pacientes = await buscarPacientesPorNombre(profesional.id, args.busqueda)
      const ids = pacientes.map((p) => p.id)
      if (ids.length === 0) {
        return { formattedMessage: `No se encontraron pacientes que coincidan con "${args.busqueda}".` }
      }
      where.id = { in: ids }
    }

    const pacientes: PacienteConOS[] = await prisma.paciente.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        telefono: true,
        notas: true,
        obraSocial: { select: { nombre: true } },
        createdAt: true,

      },
      orderBy: { nombre: "asc" },
    })

    if (pacientes.length === 0) {
      return { formattedMessage: "No tenés pacientes registrados todavía." }
    }

    const lineas = pacientes.map((p) => {
      const os = p.obraSocial ? ` — ${p.obraSocial.nombre}` : ""
      const tel = p.telefono ? ` — Tel: ${p.telefono}` : ""
      return `- **${p.nombre}**${os}${tel}`
    })

    const busquedaInfo = args.busqueda ? ` que coinciden con "${args.busqueda}"` : ""

    return {
      formattedMessage: [
        `Pacientes activos${busquedaInfo}:`,
        "",
        `Total: **${pacientes.length}** paciente(s)`,
        "",
        ...lineas,
      ].join("\n"),
    }
  },
}
