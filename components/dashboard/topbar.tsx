"use client"

import { Plus } from "lucide-react"
import { Weather } from "@/components/dashboard/weather"

export function Topbar() {
  return (
    <header className="topbar flex h-16 shrink-0 items-center justify-end border-b border-border/60 bg-background px-8 gap-2.5">
      <Weather />
      <button className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
        <Plus className="size-4" />
        Nuevo turno
      </button>
    </header>
  )
}
