import { buscarTurnosTool } from "./buscar_turnos.tool"
import { consultarDisponibilidadTool } from "./consultar_disponibilidad.tool"
import { crearTurnoTool } from "./crear_turno.tool"
import { cancelarTurnoTool } from "./cancelar_turno.tool"

export const tools = [
  buscarTurnosTool,
  consultarDisponibilidadTool,
  crearTurnoTool,
  cancelarTurnoTool,
]

export const toolExecutors: Record<string, (args: any, userId?: string) => Promise<any>> = {
  buscar_turnos: (args, userId) => buscarTurnosTool.execute(args, userId),
  consultar_disponibilidad: (args, userId) => consultarDisponibilidadTool.execute(args, userId),
  crear_turno: (args, userId) => crearTurnoTool.execute(args, userId),
  cancelar_turno: (args, userId) => cancelarTurnoTool.execute(args, userId),
}

export const toolValidators: Record<string, (args: any, userId?: string) => Promise<any>> = {
  crear_turno: (args, userId) => crearTurnoTool.validate(args, userId),
  cancelar_turno: (args, userId) => cancelarTurnoTool.validate(args, userId),
}

export const destructiveToolNames = new Set(["crear_turno", "cancelar_turno"])
