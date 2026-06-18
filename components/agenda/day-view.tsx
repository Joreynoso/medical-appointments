"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  getWeekDays,
  getDayName,
  formatDateKey,
  isToday,
} from "@/components/agenda/calendar-utils"
import { TurnoBlock, HOUR_HEIGHT } from "@/components/agenda/turno-block"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { TurnoData } from "@/lib/actions/turnos"

type DayViewProps = {
  currentDate: Date
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
  todayFlash: boolean
  onTurnoClick?: (turno: TurnoData) => void
}

export function DayView({
  currentDate,
  feriados,
  turnosPorFecha,
  horarioDesde,
  horarioHasta,
  diasLaborables,
  todayFlash,
  onTurnoClick,
}: DayViewProps) {
  const days = getWeekDays(currentDate)
  const [dayIndex, setDayIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startHour = parseInt(horarioDesde.split(":")[0])
  const endHour = parseInt(horarioHasta.split(":")[0])
  const rows = endHour - startHour
  const hours = Array.from({ length: rows }, (_, i) => startHour + i)
  const currentDay = days[dayIndex]
  const key = formatDateKey(currentDay.date)
  const holiday = feriados.get(key)
  const turnosDelDia = turnosPorFecha.get(key) ?? []

  useEffect(() => {
    const key = formatDateKey(currentDate)
    const idx = days.findIndex((d) => formatDateKey(d.date) === key)
    if (idx >= 0) setDayIndex(idx)
  }, [currentDate])

  useEffect(() => {
    if (!isToday(currentDay.date)) return
    const hour = new Date().getHours()
    const row = hour - startHour
    if (row > 0 && scrollRef.current) {
      const top = row * HOUR_HEIGHT - 60
      scrollRef.current.scrollTo({ top, behavior: "smooth" })
    }
  }, [dayIndex, currentDay.date, startHour])

  const isLaborable = useCallback(
    (day: Date) => {
      const k = formatDateKey(day)
      if (feriados.has(k)) return true
      return diasLaborables.includes(day.getDay())
    },
    [feriados, diasLaborables],
  )

  const disabled = !isLaborable(currentDay.date)
  const isDayToday = isToday(currentDay.date)
  const touchStartX = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current
      if (delta > 50) {
        setDayIndex((i) => Math.max(0, i - 1))
      } else if (delta < -50) {
        setDayIndex((i) => Math.min(6, i + 1))
      }
    },
    [],
  )

  const goPrev = useCallback(() => setDayIndex((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setDayIndex((i) => Math.min(6, i + 1)), [])

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className={cn(
          "flex items-center justify-between bg-background border-b border-border px-3 py-2.5",
          disabled && "bg-muted",
          isDayToday && todayFlash && "bg-primary/15 transition-all duration-700",
        )}
      >
        <button
          onClick={goPrev}
          disabled={dayIndex === 0}
          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Día anterior"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground">
            {getDayName(dayIndex)}
          </div>
          <div
            className={cn(
              "text-lg font-semibold leading-tight text-foreground",
              isDayToday && "text-primary",
            )}
          >
            {currentDay.dayNumber}
          </div>
          {holiday && (
            <Tooltip>
              <TooltipTrigger render={
                <div className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-24">
                  {holiday}
                </div>
              } />
              <TooltipContent side="top">
                {holiday}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={dayIndex === 6}
          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Día siguiente"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid relative overflow-y-auto max-h-[75dvh]"
        style={{
          gridTemplateColumns: "60px 1fr",
          gridTemplateRows: `repeat(${rows}, ${HOUR_HEIGHT}px)`,
        }}
      >
        {hours.map((hour) => (
          <div
            key={`time-${hour}`}
            className="border-r border-b border-border flex items-start justify-end pr-1.5"
            style={{
              gridColumn: 1,
              gridRow: hour - startHour + 1,
            }}
          >
            <span className="text-xs text-muted-foreground select-none leading-none">
              {hour.toString().padStart(2, "0")}:00
            </span>
          </div>
        ))}

        {hours.map((hour) => (
          <div
            key={`cell-${hour}`}
            className={cn("border-b border-border", disabled && "bg-muted")}
            style={{
              gridColumn: 2,
              gridRow: hour - startHour + 1,
            }}
          />
        ))}

        <div
          className="relative pointer-events-none"
          style={{
            gridColumn: 2,
            gridRow: `1 / ${rows + 1}`,
          }}
        >
          {turnosDelDia
            .filter((t) => t.estado !== "CANCELADO")
            .map((turno) => (
              <TurnoBlock
                key={turno.id}
                turno={turno}
                startHour={startHour}
                onClick={() => onTurnoClick?.(turno)}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
