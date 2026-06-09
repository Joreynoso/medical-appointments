import { PageHeader } from "@/components/dashboard/page-header"

export default function DashboardPage() {
  return (
    <div className="px-10 pb-10">
      <PageHeader title="Dashboard" description="Resumen de tu actividad" />
      <div className="space-y-10" />
    </div>
  )
}
