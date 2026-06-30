"use client"

import { useUser } from "@clerk/nextjs"
import { Bell, Search, Plus } from "lucide-react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 18) return "Buenas tardes"
  return "Buenas noches"
}

export function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="dashboard-header flex items-center justify-between px-8 pt-8 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-sans text-foreground">
          {getGreeting()}, {user?.firstName || "Profesional"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Aquí tienes un resumen de tu agenda de hoy.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Buscar"
        >
          <Search className="size-4" />
        </button>
        <button
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="size-4" />
        </button>
        <button className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
          <Plus className="size-4" />
          Nuevo turno
        </button>
      </div>
    </header>
  )
}
