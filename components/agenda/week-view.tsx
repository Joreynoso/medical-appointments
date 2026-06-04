"use client"

import { DayCard } from "@/components/agenda/day-card"
import { getWeekDays, getDayName, formatDateKey } from "@/components/agenda/calendar-utils"

type WeekViewProps = {
  currentDate: Date
  feriados: Map<string, string>
}

export function WeekView({ currentDate, feriados }: WeekViewProps) {
  const days = getWeekDays(currentDate)

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {getDayName(i)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = formatDateKey(day.date)
          const holiday = feriados.get(key)
          return (
            <DayCard
              key={key}
              day={day}
              isHoliday={!!holiday}
              holidayName={holiday}
            />
          )
        })}
      </div>
    </div>
  )
}
