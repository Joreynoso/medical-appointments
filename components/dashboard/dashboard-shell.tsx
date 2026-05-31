import { Sidebar } from "./sidebar"

export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-shell flex min-h-screen">
      <Sidebar />
      <main className="main-content ml-64 flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
