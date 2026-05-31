import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>
      <DashboardHeader />
      <section className="content-area flex-1 overflow-y-auto px-8 pb-8">
        {children}
      </section>
    </DashboardShell>
  )
}
