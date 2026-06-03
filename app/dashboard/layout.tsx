import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Topbar } from "@/components/dashboard/topbar"
import { PageHeader } from "@/components/dashboard/page-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>
      <Topbar />
      <PageHeader />
      <section className="content-area flex-1 overflow-y-auto px-10 pb-10">
        {children}
      </section>
    </DashboardShell>
  )
}
