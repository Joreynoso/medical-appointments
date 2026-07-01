"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { esTurnoPasado } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

export const HOUR_HEIGHT = 80

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

function getTurnoClasses(turno: TurnoData): string {
  if (esTurnoPasado(turno.fecha, turno.horaFin)) {
    return "bg-muted/60 border border-muted-foreground/30"
  }
  switch (turno.estado) {
    case "PENDIENTE":
      return "bg-yellow-500/20 border border-yellow-500/60"
    case "CONFIRMADO":
      return "bg-green-500/20 border border-green-500/60"
    case "CANCELADO":
      return "bg-destructive/20 border border-destructive/60"
    case "AUSENTE":
      return "bg-muted-foreground/20 border border-muted-foreground/60"
  }
}

type TurnoBlockProps = {
  turno: TurnoData
  startHour: number
  onClick?: () => void
}

export function TurnoBlock({ turno, startHour, onClick }: TurnoBlockProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={
        <div
          className={cn(
            "absolute left-0.5 right-0.5 rounded-md px-2 py-1",
            "flex items-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
            "pointer-events-auto",
            getTurnoClasses(turno),
          )}
          style={{
            top: getTurnoTop(turno.horaInicio, startHour),
            height: getTurnoHeight(turno.horaInicio, turno.horaFin, startHour),
          }}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onClick?.()
            }
          }}
        >
          <div className="truncate text-xs leading-snug text-foreground">
            <span className="font-medium">{turno.horaInicio}</span>{" "}
            {turno.paciente.nombre}
          </div>
        </div>
      } />
      <TooltipContent side="top">
        {turno.horaInicio} — {turno.paciente.nombre}
      </TooltipContent>
    </Tooltip>
  )
}
