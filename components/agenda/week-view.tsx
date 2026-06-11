"use client"

import { cn } from "@/lib/utils"
import {
  getWeekDays,
  getDayName,
  formatDateKey,
  isSunday,
} from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const HOUR_HEIGHT = 56
const START_HOUR = 7
const END_HOUR = 20
const ROWS = END_HOUR - START_HOUR
const HOURS = Array.from({ length: ROWS }, (_, i) => START_HOUR + i)

type WeekViewProps = {
  currentDate: Date
  feriados: Map<string, string>
  turnosPorFecha: Map<string, TurnoData[]>
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number)
  return { hour: h, minute: m }
}

function getMinutesFromStart(time: string): number {
  const { hour, minute } = parseTime(time)
  return (hour - START_HOUR) * 60 + minute
}

function getTurnoTop(horaInicio: string): number {
  return Math.max(0, getMinutesFromStart(horaInicio) * (HOUR_HEIGHT / 60))
}

function getTurnoHeight(horaInicio: string, horaFin: string): number {
  const duration = getMinutesFromStart(horaFin) - getMinutesFromStart(horaInicio)
  return Math.max(18, duration * (HOUR_HEIGHT / 60))
}

const estadoBorder: Record<string, string> = {
  PENDIENTE: "border-l-amber-400",
  CONFIRMADO: "border-l-emerald-500",
  CANCELADO: "border-l-red-400",
  AUSENTE: "border-l-gray-400",
}

function TurnoBlock({ turno }: { turno: TurnoData }) {
  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md border-l-2 bg-muted/50 px-2 py-1",
        "overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
        "pointer-events-auto",
        estadoBorder[turno.estado],
      )}
      style={{
        top: getTurnoTop(turno.horaInicio),
        height: getTurnoHeight(turno.horaInicio, turno.horaFin),
      }}
    >
      <div className="truncate text-xs leading-snug text-foreground">
        <span className="font-medium">{turno.horaInicio}</span>{" "}
        {turno.paciente.nombre}
      </div>
    </div>
  )
}

export function WeekView({ currentDate, feriados, turnosPorFecha }: WeekViewProps) {
  const days = getWeekDays(currentDate)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="grid relative"
        style={{
          gridTemplateColumns: "60px repeat(7, 1fr)",
          gridTemplateRows: `auto repeat(${ROWS}, ${HOUR_HEIGHT}px)`,
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
            const sunday = !holiday && isSunday(day.date)
            return (
              <div
                key={key}
                className={cn(
                  "sticky top-0 z-20 bg-background border-r border-b border-border px-2 py-2 text-center",
                  sunday && "bg-muted",
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
          {HOURS.map((hour) => (
            <div
              key={`time-${hour}`}
              className="border-r border-b border-border flex items-start justify-end pr-1.5"
              style={{
                gridColumn: 1,
                gridRow: hour - START_HOUR + 2,
              }}
            >
              <span className="text-xs text-muted-foreground select-none leading-none">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}

          {/* ── Hour grid cells ── */}
          {HOURS.flatMap((hour) =>
            days.map((day, di) => {
              const key = formatDateKey(day.date)
              const sunday = !feriados.has(key) && isSunday(day.date)
              return (
                <div
                  key={`cell-${key}-${hour}`}
                  className={cn(
                    "border-r border-b border-border",
                    sunday && "bg-muted",
                  )}
                  style={{
                    gridColumn: di + 2,
                    gridRow: hour - START_HOUR + 2,
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
                  gridRow: `2 / ${ROWS + 2}`,
                }}
              >
                {turnosDelDia.map((turno) => (
                  <TurnoBlock key={turno.id} turno={turno} />
                ))}
              </div>
            )
          })}
      </div>
    </div>
  )
}
