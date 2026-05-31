"use client"

import { Search, Bell, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"

export function Topbar() {
  return (
    <header className="topbar flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background px-8">
      <div className="topbar-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar pacientes, turnos..."
            className="h-9 w-72 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      <div className="topbar-actions flex items-center gap-2">
        <button
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="size-4" />
        </button>
        <ThemeToggle />
        <button className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
          <Plus className="size-4" />
          Nuevo turno
        </button>
      </div>
    </header>
  )
}
