"use client"

import { Calendar, Clock, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getResumenTurnosHoy, getResumenDisponibilidad, getResumenFeriados } from "@/lib/actions/chat-actions"

type QuickActionsProps = {
  onResult: (userMessage: string, assistantMessage: string) => void
  disabled: boolean
}

const actions = [
  {
    label: "Ver turnos de hoy",
    icon: Calendar,
    action: getResumenTurnosHoy,
  },
  {
    label: "Ver disponibilidad",
    icon: Clock,
    action: getResumenDisponibilidad,
  },
  {
    label: "Consultar feriados",
    icon: CalendarDays,
    action: getResumenFeriados,
  },
]

export function QuickActions({ onResult, disabled }: QuickActionsProps) {
  async function handleClick(label: string, fn: () => Promise<string>) {
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
    <div className="flex flex-wrap gap-2 px-6 pb-3 pt-3">
      {actions.map(({ label, icon: Icon, action }) => (
        <Button
          key={label}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => handleClick(label, action)}
        >
          <Icon className="size-3.5" />
          {label}
        </Button>
      ))}
    </div>
  )
}
