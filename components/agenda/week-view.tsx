"use client"

import { cn } from "@/lib/utils"
import {
  getWeekDays,
  getDayName,
  formatDateKey,
} from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const HOUR_HEIGHT = 56

type WeekViewProps = {
  currentDate: Date
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
  todayFlash: boolean
  onTurnoClick?: (turno: TurnoData) => void
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number)
  return { hour: h, minute: m }
}

function getMinutesFromStart(time: string, startHour: number): number {
  const { hour, minute } = parseTime(time)
  return (hour - startHour) * 60 + minute
}

function getTurnoTop(horaInicio: string, startHour: number): number {
  return Math.max(0, getMinutesFromStart(horaInicio, startHour) * (HOUR_HEIGHT / 60))
}

function getTurnoHeight(horaInicio: string, horaFin: string, startHour: number): number {
  const duration = getMinutesFromStart(horaFin, startHour) - getMinutesFromStart(horaInicio, startHour)
  return Math.max(18, duration * (HOUR_HEIGHT / 60))
}

const estadoBorder: Record<string, string> = {
  PENDIENTE: "border-l-amber-400",
  CONFIRMADO: "border-l-emerald-500",
  CANCELADO: "border-l-red-400",
  AUSENTE: "border-l-gray-400",
}

function TurnoBlock({ turno, startHour, onClick }: { turno: TurnoData; startHour: number; onClick?: () => void }) {
  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md border-l-2 bg-muted/50 px-2 py-1",
        "overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
        "pointer-events-auto",
        estadoBorder[turno.estado],
      )}
      style={{
        top: getTurnoTop(turno.horaInicio, startHour),
        height: getTurnoHeight(turno.horaInicio, turno.horaFin, startHour),
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.() } }}
    >
      <div className="truncate text-xs leading-snug text-foreground">
        <span className="font-medium">{turno.horaInicio}</span>{" "}
        {turno.paciente.nombre}
      </div>
    </div>
  )
}

export function WeekView({ currentDate, feriados, turnosPorFecha, horarioDesde, horarioHasta, diasLaborables, todayFlash, onTurnoClick }: WeekViewProps) {
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
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="grid relative"
        style={{
          gridTemplateColumns: "60px repeat(7, 1fr)",
          gridTemplateRows: `auto repeat(${rows}, ${HOUR_HEIGHT}px)`,
        }}
      >
          {/* ── Header row ── */}
          <div
            className="sticky top-0 z-20 bg-background border-r border-b border-border"
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
                  "sticky top-0 z-20 bg-background border-r border-b border-border px-2 py-2 text-center transition-all duration-700",
                  disabled && "bg-muted",
                  day.isToday && todayFlash && "bg-primary/15",
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
                  <div className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {holiday}
                  </div>
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
