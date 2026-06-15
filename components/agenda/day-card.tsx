"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { DayInfo } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const estadoBar: Record<string, string> = {
  PENDIENTE: "bg-amber-400",
  CONFIRMADO: "bg-emerald-500",
  CANCELADO: "bg-red-400",
  AUSENTE: "bg-gray-400",
}

const TURNOS_SM = 0
const TURNOS_MD = 1
const TURNOS_LG = 2
const TURNOS_XL = 3
const TURNOS_2XL = 4

type DayCardProps = {
  day: DayInfo
  isHoliday: boolean
  holidayName?: string
  turnos?: TurnoData[]
  className?: string
  diasLaborables: number[]
  flash?: boolean
  onTurnoClick?: (turno: TurnoData) => void
}

export function DayCard({ day, isHoliday, holidayName, turnos = [], className, diasLaborables, flash, onTurnoClick }: DayCardProps) {
  const [maxVisibles, setMaxVisibles] = useState(TURNOS_2XL)
  const disabled = !isHoliday && !diasLaborables.includes(day.date.getDay())

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 768) setMaxVisibles(TURNOS_SM)
      else if (w < 1024) setMaxVisibles(TURNOS_MD)
      else if (w < 1280) setMaxVisibles(TURNOS_LG)
      else if (w < 1536) setMaxVisibles(TURNOS_XL)
      else setMaxVisibles(TURNOS_2XL)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const turnosVisibles = turnos.filter((t) => t.estado !== "CANCELADO")
  const visibles = turnosVisibles.slice(0, maxVisibles)
  const restantes = turnosVisibles.length - maxVisibles

  const card = (
    <button
      type="button"
      className={cn(
        "group relative flex aspect-square w-full flex-col p-1.5 md:p-2 2xl:p-3 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "bg-card hover:bg-card",
        !day.isCurrentMonth && "opacity-40",
        disabled && "bg-muted hover:bg-muted",
        day.isToday && flash && "bg-primary/15 transition-all duration-700",
        className,
      )}
    >
      <span className="self-end text-[11px] 2xl:text-sm font-medium leading-none text-foreground">
        {day.dayNumber}
      </span>

      <div className="mt-1 flex flex-col gap-1 overflow-hidden">
        {isHoliday && holidayName && (
          <Tooltip>
            <TooltipTrigger render={
              <span className="self-center rounded bg-muted px-2 py-0.5 text-center text-[10px] font-medium text-muted-foreground truncate max-w-full">
                {holidayName}
              </span>
            } />
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border">
              {holidayName}
            </TooltipContent>
          </Tooltip>
        )}
        {maxVisibles === 0 && turnosVisibles.length > 0 ? (
          <Tooltip>
            <TooltipTrigger render={
              <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 min-w-0 cursor-default">
                <span className="h-2 w-2 shrink-0 rounded-sm bg-gray-400" />
                <span className="truncate text-[10px] 2xl:text-[11px] leading-snug text-muted-foreground">
                  {turnosVisibles.length} turnos
                </span>
              </div>
            } />
            <TooltipContent side="bottom" align="start" className="bg-popover text-popover-foreground border border-border p-2">
              <div className="space-y-1.5">
                {turnosVisibles.map((t) => (
                  <div key={t.id} className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                    <span className={cn("h-2 w-2 shrink-0 rounded-sm", estadoBar[t.estado])} />
                    <span className="font-medium">{t.horaInicio}</span>
                    <span className="text-muted-foreground">{t.paciente.nombre}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            {visibles.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onTurnoClick?.(t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTurnoClick?.(t) } }}
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-sm", estadoBar[t.estado])} />
                <span className="truncate text-[10px] 2xl:text-[11px] leading-snug text-foreground">
                  {t.horaInicio} {t.paciente.nombre}
                </span>
              </div>
            ))}
            {restantes > 0 && (
              <Tooltip>
                <TooltipTrigger render={
                  <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 min-w-0 cursor-default">
                    <span className="h-2 w-2 shrink-0 rounded-sm bg-gray-400" />
                    <span className="truncate text-[10px] 2xl:text-[11px] leading-snug text-muted-foreground">
                      +{restantes} más
                    </span>
                  </div>
                } />
                <TooltipContent side="bottom" align="start" className="bg-popover text-popover-foreground border border-border p-2">
                  <div className="space-y-1.5">
                    {turnosVisibles.slice(maxVisibles).map((t) => (
                      <div key={t.id} className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                        <span className={cn("h-2 w-2 shrink-0 rounded-sm", estadoBar[t.estado])} />
                        <span className="font-medium">{t.horaInicio}</span>
                        <span className="text-muted-foreground">{t.paciente.nombre}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </button>
  )

  if (day.isToday) {
    return (
      <Tooltip>
        <TooltipTrigger render={card} />
        <TooltipContent side="top">Hoy</TooltipContent>
      </Tooltip>
    )
  }

  return card
}
