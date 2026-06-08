"use client"

import { cn } from "@/lib/utils"
import { SidebarProvider, useSidebar } from "./sidebar-context"
import { Sidebar } from "./sidebar"

function ShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="dashboard-shell flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "main-content flex flex-1 flex-col transition-[margin] duration-300",
          collapsed ? "ml-16" : "ml-64",
        )}
      >
        {children}
      </main>
    </div>
  )
}

export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  )
}
