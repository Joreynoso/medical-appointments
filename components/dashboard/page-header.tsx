"use client"

import { usePathname } from "next/navigation"
import { usePageHeaderActions } from "@/components/dashboard/page-header-context"

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

export function PageHeader() {
  const pathname = usePathname()
  const config = findPageConfig(pathname)
  const { actions } = usePageHeaderActions()

  if (!config) return null

  return (
    <section className="page-header flex items-center justify-between px-10 py-8">
      <div className="page-header-content">
        <h1 className="text-xl font-serif text-foreground">
          {config.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {config.description}
        </p>
      </div>
      <div className="page-header-actions flex items-center gap-3">
        {actions}
      </div>
    </section>
  )
}
