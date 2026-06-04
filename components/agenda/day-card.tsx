"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { DayInfo } from "@/components/agenda/calendar-utils"
import { formatDateKey, isSunday } from "@/components/agenda/calendar-utils"

type DayCardProps = {
  day: DayInfo
  isHoliday: boolean
  holidayName?: string
}

export function DayCard({ day, isHoliday, holidayName }: DayCardProps) {
  function handleClick() {
    const fecha = formatDateKey(day.date)
    if (isHoliday) {
      toast(`${fecha} — ${holidayName}`, {
        description: "Feriado nacional",
      })
    } else {
      toast(fecha, {
        description: day.isToday ? "Hoy" : day.isCurrentMonth ? "" : "Otro mes",
      })
    }
  }

  const sunday = !isHoliday && isSunday(day.date)

  const button = (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative flex aspect-square w-full flex-col items-end justify-start rounded-xl border p-2 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:bg-card",
        day.isToday && "border-primary/40",
        !day.isCurrentMonth && "opacity-40",
      )}
    >
      <span className="text-sm font-medium leading-none text-foreground">
        {day.dayNumber}
      </span>
      {isHoliday && holidayName && (
        <span className="mt-1.5 text-[11px] leading-tight text-muted-foreground line-clamp-2">
          {holidayName}
        </span>
      )}
    </button>
  )

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      {day.isToday && (
        <TooltipContent side="top" align="center">
          Hoy
        </TooltipContent>
      )}
    </Tooltip>
  )
}
