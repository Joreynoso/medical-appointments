import { getProximosTurnos } from "@/lib/actions/turnos"
import { ProximosTurnosCard } from "@/components/dashboard/proximos-turnos-card"

export async function ProximosTurnosWrapper() {
  const turnos = await getProximosTurnos(10)
  return <ProximosTurnosCard turnos={turnos} />
}
