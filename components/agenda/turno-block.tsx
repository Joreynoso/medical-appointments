"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { TurnoData } from "@/lib/actions/turnos"

export const HOUR_HEIGHT = 56

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
