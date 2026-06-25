import { PageHeader } from "@/components/dashboard/page-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"

export default function DashboardPage() {
  return (
    <div className="px-4 md:px-10 pb-10 min-h-full flex flex-col overflow-y-auto">
      <PageHeader title="MedPilot" description="Resumen de tu actividad" />
      <DashboardCards />
    </div>
  )
}
