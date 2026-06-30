import { getTurnosEnRango, getTurnosPorMes } from "@/lib/actions/turnos"
import { TurnosPorDiaChart } from "@/components/dashboard/turnos-por-dia-chart"
import { TurnosPorMesChart } from "@/components/dashboard/turnos-por-mes-chart"

function getSemanaActual() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() + diff)
  const sabado = new Date(lunes)
  sabado.setDate(lunes.getDate() + 5)
  return {
    desde: lunes.toISOString().slice(0, 10),
    hasta: sabado.toISOString().slice(0, 10),
  }
}

function agruparPorDia(turnos: { fecha: string }[]) {
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const conteo: Record<string, number> = {}
  dias.forEach((d) => (conteo[d] = 0))

  turnos.forEach((t) => {
    const fecha = new Date(t.fecha + "T12:00:00")
    const dia = fecha.getDay()
    if (dia >= 1 && dia <= 6) {
      conteo[dias[dia - 1]]++
    }
  })

  return dias.map((d) => ({ dia: d, turnos: conteo[d] }))
}

export async function ChartsWrapper() {
  const [turnosSemana, turnosPorMes] = await Promise.all([
    getTurnosEnRango(getSemanaActual().desde, getSemanaActual().hasta),
    getTurnosPorMes(6),
  ])
  const turnosPorDia = agruparPorDia(turnosSemana)

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
        <h3 className="text-lg font-sans text-foreground shrink-0">
          Turnos por día
        </h3>
        <div className="flex-1 min-h-0">
          <TurnosPorDiaChart data={turnosPorDia} />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
        <h3 className="text-lg font-sans text-foreground shrink-0">
          Turnos por mes
        </h3>
        <div className="flex-1 min-h-0">
          <TurnosPorMesChart data={turnosPorMes} />
        </div>
      </div>
    </>
  )
}
