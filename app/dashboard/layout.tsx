import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Topbar } from "@/components/dashboard/topbar"
import { PageHeaderActionsProvider } from "@/components/dashboard/page-header-context"
import { CrearTurnoProvider } from "@/components/agenda/crear-turno-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { sincronizarSiEsNecesario } from "@/lib/feriados"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await auth.protect()
  await sincronizarSiEsNecesario()

  return (
    <DashboardShell>
      <PageHeaderActionsProvider>
        <TooltipProvider>
        <CrearTurnoProvider>
        <Topbar />
        <section className="content-area flex-1 overflow-y-auto">
          {children}
        </section>
        </CrearTurnoProvider>
        </TooltipProvider>
      </PageHeaderActionsProvider>
      <Toaster
        position="top-center"
        closeButton
        toastOptions={{
          classNames: {
            closeButton:
              "bg-card text-primary border-border",
          },
        }}
        style={
          {
            "--normal-bg": "var(--card)",
            "--normal-border": "var(--border)",
            "--normal-text": "var(--foreground)",
            "--success-bg": "var(--chart-3)",
            "--success-border": "var(--border)",
            "--success-text": "var(--foreground)",
            "--error-bg": "var(--destructive)",
            "--error-border": "var(--destructive)",
            "--error-text": "var(--destructive-foreground)",
          } as React.CSSProperties
        }
      />
    </DashboardShell>
  )
}
