import { PageHeaderActionsClient } from "./page-header-actions-client"

type PageConfig = {
  title: string
  description: string
}

const pages: Record<string, PageConfig> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Resumen de tu actividad",
  },
  "/dashboard/agenda": {
    title: "Agenda",
    description: "Gestiona tus turnos y disponibilidad",
  },
  "/dashboard/pacientes": {
    title: "Pacientes",
    description: "Administra tu lista de pacientes",
  },
  "/dashboard/chat": {
    title: "Chat IA",
    description: "Consulta y gestiona turnos con lenguaje natural",
  },
  "/dashboard/configuracion": {
    title: "Configuración",
    description: "Personaliza tu consultorio",
  },
}

function findPageConfig(pathname: string): PageConfig | undefined {
  const sorted = Object.keys(pages).sort((a, b) => b.length - a.length)
  const match = sorted.find(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  )
  return match ? pages[match] : undefined
}

type PageHeaderProps = {
  title?: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 md:py-8">
      <div className="page-header-content">
        <h1 className="text-xl font-serif text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="page-header-actions flex flex-wrap items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end">
        <PageHeaderActionsClient />
      </div>
    </section>
  )
}
