"use client"

import { cn } from "@/lib/utils"
import { DayCard } from "@/components/agenda/day-card"
import { getMonthGrid, getDayName, formatDateKey } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

type MonthViewProps = {
  year: number
  month: number
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
  diasLaborables: number[]
  todayFlash: boolean
}

export function MonthView({ year, month, feriados, turnosPorFecha, diasLaborables, todayFlash }: MonthViewProps) {
  const weeks = getMonthGrid(year, month)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="border-b border-border px-2 py-2 text-center text-[10px] 2xl:text-xs font-medium text-muted-foreground"
          >
            {getDayName(i)}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            const key = formatDateKey(day.date)
            const holiday = feriados.get(key)
            const turnosDelDia = turnosPorFecha.get(key) ?? []
            const isLastWeek = wi === weeks.length - 1
            return (
              <DayCard
                key={key}
                day={day}
                isHoliday={!!holiday}
                holidayName={holiday}
                turnos={turnosDelDia}
                diasLaborables={diasLaborables}
                flash={todayFlash}
                className={cn(
                  "border-border",
                  di !== 6 && "border-r",
                  !isLastWeek && "border-b",
                )}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
