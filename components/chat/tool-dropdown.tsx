"use client"

import { Calendar, Clock, CalendarDays, CalendarPlus, CalendarX, Wrench } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getResumenTurnosHoy, getResumenDisponibilidad, getResumenFeriados } from "@/lib/actions/chat-actions"

type ToolDropdownProps = {
  onResult: (userMessage: string, assistantMessage: string) => void
  onSend: (message: string) => void
  disabled: boolean
}

const serverItems = [
  { label: "Ver turnos de hoy", icon: Calendar, fn: getResumenTurnosHoy },
  { label: "Ver disponibilidad", icon: Clock, fn: getResumenDisponibilidad },
  { label: "Consultar feriados", icon: CalendarDays, fn: getResumenFeriados },
] as const

const sendItems = [
  { label: "Crear turno", icon: CalendarPlus, message: "Crear turno" },
  { label: "Cancelar turno", icon: CalendarX, message: "Cancelar turno" },
] as const

export function ToolDropdown({ onResult, onSend, disabled }: ToolDropdownProps) {
  async function handleServer(label: string, fn: () => Promise<string>) {
    if (disabled) return
    onResult(label, "⏳ Consultando...")
    try {
      const result = await fn()
      onResult(label, result)
    } catch {
      onResult(label, "❌ Ocurrió un error al realizar la consulta.")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Wrench className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {serverItems.map(({ label, icon: Icon, fn }) => (
          <DropdownMenuItem key={label} onClick={() => handleServer(label, fn)}>
            <Icon className="mr-2 size-4" />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {sendItems.map(({ label, icon: Icon, message }) => (
          <DropdownMenuItem key={label} onClick={() => onSend(message)}>
            <Icon className="mr-2 size-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
