import { buscarTurnosTool } from "./buscar_turnos.tool"
import { consultarDisponibilidadTool } from "./consultar_disponibilidad.tool"

export const tools = [buscarTurnosTool, consultarDisponibilidadTool]

export const toolExecutors: Record<string, (args: any, userId?: string) => Promise<any>> = {
  buscar_turnos: (args, userId) => buscarTurnosTool.execute(args, userId),
  consultar_disponibilidad: (args, userId) => consultarDisponibilidadTool.execute(args, userId),
}
