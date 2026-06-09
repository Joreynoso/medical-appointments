import { Suspense } from "react"
import { getFeriadosEnRango } from "@/lib/actions/feriados"
import { getTurnosEnRango } from "@/lib/actions/turnos"
import { AgendaClient } from "@/components/agenda/agenda-client"
import { PageHeader } from "@/components/dashboard/page-header"

function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const desde = new Date(year, month - 1, 1)
  const hasta = new Date(year, month + 2, 0)
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10),
  }
}

async function AgendaContent() {
  const now = new Date()
  const año = now.getFullYear()
  const { desde, hasta } = getMonthRange(now)
  const [[feriadosAñoActual, feriadosAnterior, feriadosSiguiente], turnos] = await Promise.all([
    Promise.all([
      getFeriadosEnRango(año),
      getFeriadosEnRango(año - 1),
      getFeriadosEnRango(año + 1),
    ]),
    getTurnosEnRango(desde, hasta),
  ])

  return <AgendaClient initialFeriados={[...feriadosAñoActual, ...feriadosAnterior, ...feriadosSiguiente]} initialTurnos={turnos} />
}

export default function AgendaPage() {
  return (
    <div className="px-10 pb-10">
      <PageHeader title="Agenda" description="Gestiona tus turnos y disponibilidad" />
      <Suspense fallback={<div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Cargando agenda...</p>
      </div>}>
        <AgendaContent />
      </Suspense>
    </div>
  )
}
