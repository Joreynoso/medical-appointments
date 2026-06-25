import { Suspense } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { ProximosTurnosWrapper } from "@/components/dashboard/proximos-turnos-wrapper"
import { PacientesWrapper } from "@/components/dashboard/pacientes-wrapper"
import { ChartsWrapper } from "@/components/dashboard/charts-wrapper"
import {
  WelcomeSkeleton,
  ProximosTurnosSkeleton,
  PacientesSkeleton,
  ChartSkeleton,
} from "@/components/dashboard/skeletons"

export default function DashboardPage() {
  return (
    <div className="px-4 md:px-10 pb-10 min-h-full flex flex-col overflow-y-auto">
      <PageHeader title="MedPilot" description="Resumen de tu actividad" />

      <div className="flex-1 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<WelcomeSkeleton />}>
            <WelcomeCard />
          </Suspense>
          <Suspense fallback={<ProximosTurnosSkeleton />}>
            <ProximosTurnosWrapper />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Suspense fallback={<PacientesSkeleton />}>
            <PacientesWrapper />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <ChartsWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
