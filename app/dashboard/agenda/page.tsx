import { getFeriadosEnRango } from "@/lib/actions/feriados"
import { getTurnosEnRango } from "@/lib/actions/turnos"
import { AgendaClient } from "@/components/agenda/agenda-client"

export default async function AgendaPage() {
  const año = new Date().getFullYear()
  const [feriados, turnos] = await Promise.all([
    getFeriadosEnRango(año),
    getTurnosEnRango(`${año}-01-01`, `${año}-12-31`),
  ])

  return <AgendaClient initialFeriados={feriados} initialTurnos={turnos} />
}
