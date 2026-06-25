"use client"

import { Menu, Plus, Bot } from "lucide-react"
import { Weather } from "@/components/dashboard/weather"
import { useCrearTurno } from "@/components/agenda/crear-turno-context"
import { useSidebar } from "@/components/dashboard/sidebar-context"
import { useChat } from "@/components/chat/chat-context"

export function Topbar() {
  const { openCrearTurno } = useCrearTurno()
  const { toggleMobileOpen } = useSidebar()
  const { openChat } = useChat()

  return (
    <header className="topbar flex h-16 shrink-0 items-center border-b border-border/60 bg-background px-4 md:px-8 gap-2.5">
      <button
        onClick={toggleMobileOpen}
        className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted -ml-1 md:-ml-2 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Weather />
        <button
          type="button"
          onClick={openChat}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-foreground transition-all hover:bg-muted"
        >
          <Bot className="size-3.5 md:size-4 text-primary" />
          <span className="hidden md:inline">Chat IA (Besta)</span>
        </button>
        <button
          type="button"
          onClick={openCrearTurno}
          className="inline-flex cursor-pointer items-center gap-1.5 md:gap-2 rounded-full bg-primary px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus className="size-3.5 md:size-4" />
          Nuevo turno
        </button>
      </div>
    </header>
  )
}
