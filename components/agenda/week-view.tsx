"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  getWeekDays,
  getDayName,
  formatDateKey,
} from "@/components/agenda/calendar-utils"
import { TurnoBlock, HOUR_HEIGHT } from "@/components/agenda/turno-block"
import { DayView } from "@/components/agenda/day-view"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { TurnoData } from "@/lib/actions/turnos"

type WeekViewProps = {
  currentDate: Date
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
  onTurnoClick?: (turno: TurnoData) => void
}

export function WeekView({ currentDate, feriados, turnosPorFecha, horarioDesde, horarioHasta, diasLaborables, onTurnoClick }: WeekViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!isDesktop) {
    return (
      <DayView
        currentDate={currentDate}
        feriados={feriados}
        turnosPorFecha={turnosPorFecha}
        horarioDesde={horarioDesde}
        horarioHasta={horarioHasta}
        diasLaborables={diasLaborables}
        onTurnoClick={onTurnoClick}
      />
    )
  }
  const days = getWeekDays(currentDate)
  const startHour = parseInt(horarioDesde.split(":")[0])
  const endHour = parseInt(horarioHasta.split(":")[0])
  const rows = endHour - startHour
  const hours = Array.from({ length: rows }, (_, i) => startHour + i)

  function isLaborable(day: Date) {
    const key = formatDateKey(day)
    if (feriados.has(key)) return true
    return diasLaborables.includes(day.getDay())
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div
        className="grid relative"
        style={{
          gridTemplateColumns: "60px repeat(7, 1fr)",
          gridTemplateRows: `auto repeat(${rows}, ${HOUR_HEIGHT}px)`,
        }}
      >
          {/* ── Header row ── */}
          <div
            className="sticky top-0 z-20 bg-card border-r border-b border-border"
            style={{ gridColumn: 1, gridRow: 1 }}
          />
          {days.map((day, i) => {
            const key = formatDateKey(day.date)
            const holiday = feriados.get(key)
            const disabled = !isLaborable(day.date)
            return (
              <div
                key={key}
                className={cn(
                  "sticky top-0 z-20 bg-card border-r border-b border-border px-2 py-2 text-center",
                  disabled && "bg-muted",
                )}
                style={{ gridColumn: i + 2, gridRow: 1 }}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {getDayName(i)}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium leading-none text-foreground",
                    day.isToday && "text-primary",
                  )}
                >
                  {day.dayNumber}
                </div>
                {holiday && (
                  <Tooltip>
                    <TooltipTrigger render={
                      <div className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate w-full">
                        {holiday}
                      </div>
                    } />
                    <TooltipContent side="top">
                      {holiday}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )
          })}

          {/* ── Time labels ── */}
          {hours.map((hour) => (
            <div
              key={`time-${hour}`}
              className="border-r border-b border-border flex items-start justify-end pr-1.5"
              style={{
                gridColumn: 1,
                gridRow: hour - startHour + 2,
              }}
            >
              <span className="text-xs text-muted-foreground select-none leading-none">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}

          {/* ── Hour grid cells ── */}
          {hours.flatMap((hour) =>
            days.map((day, di) => {
              const key = formatDateKey(day.date)
              const disabled = !isLaborable(day.date)
              return (
                <div
                  key={`cell-${key}-${hour}`}
                  className={cn(
                    "border-r border-b border-border",
                    disabled && "bg-muted",
                  )}
                  style={{
                    gridColumn: di + 2,
                    gridRow: hour - startHour + 2,
                  }}
                />
              )
            }),
          )}

          {/* ── Turno overlays ── */}
          {days.map((day, di) => {
            const key = formatDateKey(day.date)
            const turnosDelDia = turnosPorFecha.get(key) ?? []
            return (
              <div
                key={`overlay-${key}`}
                className="relative pointer-events-none"
                style={{
                  gridColumn: di + 2,
                  gridRow: `2 / ${rows + 2}`,
                }}
              >
                {turnosDelDia.filter((t) => t.estado !== "CANCELADO").map((turno) => (
                  <TurnoBlock key={turno.id} turno={turno} startHour={startHour} onClick={() => onTurnoClick?.(turno)} />
                ))}
              </div>
            )
          })}
      </div>
    </div>
  )
}
