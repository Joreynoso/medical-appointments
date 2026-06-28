import { buscarTurnosTool } from "./buscar_turnos.tool"
import { consultarDisponibilidadTool } from "./consultar_disponibilidad.tool"
import { crearTurnoTool } from "./crear_turno.tool"
import { cancelarTurnoTool } from "./cancelar_turno.tool"
import { listarPacientesTool } from "./listar_pacientes.tool"

export const tools = [
  buscarTurnosTool,
  consultarDisponibilidadTool,
  crearTurnoTool,
  cancelarTurnoTool,
  listarPacientesTool,
]

type ToolResult = Record<string, unknown>

type Executor = (args: Record<string, unknown>, userId?: string) => Promise<ToolResult>

export const toolExecutors: Record<string, Executor> = {
  buscar_turnos: (args, userId) =>
    buscarTurnosTool.execute(args as Parameters<typeof buscarTurnosTool.execute>[0], userId),
  consultar_disponibilidad: (args, userId) =>
    consultarDisponibilidadTool.execute(args as Parameters<typeof consultarDisponibilidadTool.execute>[0], userId),
  crear_turno: (args, userId) =>
    crearTurnoTool.execute(args as Parameters<typeof crearTurnoTool.execute>[0], userId),
  cancelar_turno: (args, userId) =>
    cancelarTurnoTool.execute(args as Parameters<typeof cancelarTurnoTool.execute>[0], userId),
  listar_pacientes: (args, userId) =>
    listarPacientesTool.execute(args as Parameters<typeof listarPacientesTool.execute>[0], userId),
}

export const toolValidators: Record<string, Executor> = {
  crear_turno: (args, userId) =>
    crearTurnoTool.validate(args as Parameters<typeof crearTurnoTool.validate>[0], userId),
  cancelar_turno: (args, userId) =>
    cancelarTurnoTool.validate(args as Parameters<typeof cancelarTurnoTool.validate>[0], userId),
}

export const destructiveToolNames = new Set(["crear_turno", "cancelar_turno"])
