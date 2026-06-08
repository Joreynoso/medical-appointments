"use client"

import { cn } from "@/lib/utils"
import { DayCard } from "@/components/agenda/day-card"
import { getWeekDays, getDayName, formatDateKey } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

type WeekViewProps = {
  currentDate: Date
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
}

export function WeekView({ currentDate, feriados, turnosPorFecha }: WeekViewProps) {
  const days = getWeekDays(currentDate)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="border-b border-border px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {getDayName(i)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, di) => {
          const key = formatDateKey(day.date)
          const holiday = feriados.get(key)
          const turnosDelDia = turnosPorFecha.get(key) ?? []
          return (
            <DayCard
              key={key}
              day={day}
              isHoliday={!!holiday}
              holidayName={holiday}
              turnos={turnosDelDia}
              className={cn(
                "border-border",
                di !== 6 && "border-r",
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
