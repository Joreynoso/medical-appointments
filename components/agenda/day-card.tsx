"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { DayInfo } from "@/components/agenda/calendar-utils"
import { isSunday } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const estadoBar: Record<string, string> = {
  PENDIENTE: "bg-amber-400",
  CONFIRMADO: "bg-emerald-500",
  CANCELADO: "bg-red-400",
  AUSENTE: "bg-gray-400",
}

const MAX_TURNOS_VISIBLES = 6

type DayCardProps = {
  day: DayInfo
  isHoliday: boolean
  holidayName?: string
  turnos?: TurnoData[]
}

export function DayCard({ day, isHoliday, holidayName, turnos = [] }: DayCardProps) {
  const sunday = !isHoliday && isSunday(day.date)
  const visibles = turnos.slice(0, MAX_TURNOS_VISIBLES)
  const restantes = turnos.length - MAX_TURNOS_VISIBLES

  const card = (
    <button
      type="button"
      className={cn(
        "group relative flex aspect-square w-full flex-col rounded-xl border p-3 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:bg-card",
        day.isToday && "border-primary/40",
        !day.isCurrentMonth && "opacity-40",
        sunday && "bg-muted hover:bg-muted",
      )}
    >
      <span className="self-end text-sm font-medium leading-none text-foreground">
        {day.dayNumber}
      </span>

      <div className="mt-1 flex flex-col gap-1 overflow-hidden">
        {isHoliday && holidayName && (
          <span className="self-center rounded-full bg-muted px-2 py-0.5 text-center text-[10px] font-medium text-muted-foreground">
            {holidayName}
          </span>
        )}
        {visibles.map((t) => (
          <div key={t.id} className="flex items-center gap-1 min-w-0">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", estadoBar[t.estado])} />
            <span className="truncate text-[10px] leading-snug text-foreground">
              {t.horaInicio} {t.paciente.nombre}
            </span>
          </div>
        ))}
        {restantes > 0 && (
          <span className="text-[11px] leading-tight text-muted-foreground">
            +{restantes} más
          </span>
        )}
      </div>
    </button>
  )

  if (day.isToday) {
    return (
      <Tooltip>
        <TooltipTrigger render={card} />
        <TooltipContent side="top">Hoy</TooltipContent>
      </Tooltip>
    )
  }

  return card
}
