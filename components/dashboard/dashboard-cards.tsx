import Link from "next/link"
import { ImageIcon } from "lucide-react"
import { getProximosTurnos, getTurnosEnRango, getTurnosPorMes } from "@/lib/actions/turnos"
import { listarPacientes } from "@/lib/actions/pacientes"
import { listarObrasSociales } from "@/lib/actions/obras-sociales"
import { PacientesRecientesCard } from "@/components/dashboard/pacientes-recientes-card"
import { ProximosTurnosCard } from "@/components/dashboard/proximos-turnos-card"
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

export async function DashboardCards() {
  const [turnos, pacientes, obrasSociales, turnosSemana, turnosPorMes] = await Promise.all([
    getProximosTurnos(10),
    listarPacientes(),
    listarObrasSociales(),
    getTurnosEnRango(getSemanaActual().desde, getSemanaActual().hasta),
    getTurnosPorMes(6),
  ])
  const turnosPorDia = agruparPorDia(turnosSemana)

  return (
    <div className="flex-1 flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8">
        <div className="rounded-lg border border-border bg-card flex flex-col lg:flex-row">
          <div className="lg:w-3/5 flex flex-col justify-center p-6 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-serif text-foreground leading-tight">
              ¡Bienvenido a MedPilot!
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
              Gestiona tus turnos, pacientes y agenda desde un solo lugar, de forma rápida y sin complicaciones.
            </p>
            <Link
              href="/dashboard/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all w-fit"
            >
              Ir a la agenda
            </Link>
          </div>
          <div className="hidden lg:flex self-stretch w-2/5">
            <div className="w-full h-full border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
              <ImageIcon className="size-12 text-muted-foreground/40" />
            </div>
          </div>
        </div>

        <ProximosTurnosCard turnos={turnos} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PacientesRecientesCard
          initialPacientes={pacientes}
          obrasSociales={obrasSociales}
        />
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
          <h3 className="text-lg font-serif text-foreground shrink-0">
            Turnos por día
          </h3>
          <div className="flex-1 min-h-0">
            <TurnosPorDiaChart data={turnosPorDia} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
          <h3 className="text-lg font-serif text-foreground shrink-0">
            Turnos por mes
          </h3>
          <div className="flex-1 min-h-0">
            <TurnosPorMesChart data={turnosPorMes} />
          </div>
        </div>
      </div>
    </div>
  )
}
