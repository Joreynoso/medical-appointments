import { getFeriadosEnRango } from "@/lib/actions/feriados"
import { getTurnosEnRango, getConfiguracionHoraria } from "@/lib/actions/turnos"
import { listarPacientes } from "@/lib/actions/pacientes"
import { listarObrasSociales } from "@/lib/actions/obras-sociales"
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

export default async function AgendaPage() {
  const now = new Date()
  const año = now.getFullYear()
  const { desde, hasta } = getMonthRange(now)
  const [[feriadosAñoActual, feriadosAnterior, feriadosSiguiente], turnos, pacientes, obrasSociales, config] = await Promise.all([
    Promise.all([
      getFeriadosEnRango(año),
      getFeriadosEnRango(año - 1),
      getFeriadosEnRango(año + 1),
    ]),
    getTurnosEnRango(desde, hasta),
    listarPacientes(),
    listarObrasSociales(),
    getConfiguracionHoraria(),
  ])

  return (
    <div className="px-4 md:px-10 pb-10">
      <PageHeader title="Agenda" description="Gestiona tus turnos y disponibilidad" />
      <AgendaClient
        initialFeriados={[...feriadosAñoActual, ...feriadosAnterior, ...feriadosSiguiente]}
        initialTurnos={turnos}
        initialPacientes={pacientes.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          telefono: p.telefono,
          obraSocialNombre: p.obraSocial?.nombre ?? null,
        }))}
        initialObrasSociales={obrasSociales.map((o) => ({ id: o.id, nombre: o.nombre }))}
        horarioDesde={config.horarioDesde}
        horarioHasta={config.horarioHasta}
        diasLaborables={config.diasLaborables}
      />
    </div>
  )
}
