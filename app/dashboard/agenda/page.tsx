import { getFeriadosEnRango } from "@/lib/actions/feriados"
import { AgendaClient } from "@/components/agenda/agenda-client"

export default async function AgendaPage() {
  const año = new Date().getFullYear()
  const feriados = await getFeriadosEnRango(año)

  return <AgendaClient initialFeriados={feriados} />
}
