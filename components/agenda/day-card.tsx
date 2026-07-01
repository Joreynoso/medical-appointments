"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { X, CalendarDays } from "lucide-react"
import { Dialog } from "@base-ui/react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { getDayName, formatDateKey, esTurnoPasado } from "@/components/agenda/calendar-utils"
import type { DayInfo } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const estadoBar: Record<string, string> = {
  PENDIENTE: "bg-yellow-500",
  CONFIRMADO: "bg-green-500",
  CANCELADO: "bg-destructive",
  AUSENTE: "bg-muted-foreground",
}

function getDotColor(t: TurnoData): string {
  if (esTurnoPasado(t.fecha, t.horaFin)) return "bg-gray-400"
  return estadoBar[t.estado]
}

function getTurnoCls(t: TurnoData): string {
  if (esTurnoPasado(t.fecha, t.horaFin)) return "bg-muted/60 border border-muted-foreground/30"
  switch (t.estado) {
    case "PENDIENTE": return "bg-yellow-500/20 border border-yellow-500/60"
    case "CONFIRMADO": return "bg-green-500/20 border border-green-500/60"
    case "AUSENTE": return "bg-muted-foreground/20 border border-muted-foreground/60"
    default: return "bg-muted"
  }
}

const TURNOS_MOBILE = 0
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
  onTurnoClick?: (turno: TurnoData) => void
}

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export function DayCard({ day, isHoliday, holidayName, turnos = [], className, diasLaborables, onTurnoClick }: DayCardProps) {
  const [maxVisibles, setMaxVisibles] = useState(TURNOS_2XL)
  const [modalOpen, setModalOpen] = useState(false)
  const disabled = !isHoliday && !diasLaborables.includes(day.date.getDay())
  const isOtherMonth = !day.isCurrentMonth

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 1024) setMaxVisibles(TURNOS_MOBILE)
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
  const hasManyTurnos = turnosVisibles.length > maxVisibles
  const isMobileView = maxVisibles === TURNOS_MOBILE
  const diaSemanaIdx = (day.date.getDay() + 6) % 7

  const card = (
    <button
      type="button"
      disabled={isOtherMonth}
      className={cn(
        "group relative flex aspect-square w-full flex-col p-1.5 md:p-2 2xl:p-3 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "bg-card hover:bg-card",
        isOtherMonth && "bg-muted cursor-not-allowed opacity-100 hover:bg-muted",
        disabled && "bg-muted hover:bg-muted",
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
              <span
                className="self-center rounded bg-muted px-1.5 py-0.5 text-center text-[9px] 2xl:text-[10px] font-medium text-muted-foreground truncate max-w-full"
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              >
                {holidayName}
              </span>
            } />
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border">
              {getDayName(diaSemanaIdx)} {day.dayNumber} — {holidayName}
            </TooltipContent>
          </Tooltip>
        )}

        {isMobileView ? (
          <>
            {turnosVisibles.length > 0 && (
              <div
                className="flex items-center justify-center rounded-md bg-primary/25 px-1.5 py-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setModalOpen(true) }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setModalOpen(true) } }}
              >
                <span className="text-[10px] font-bold text-primary leading-none">
                  {turnosVisibles.length}
                </span>
              </div>
            )}
            <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
                <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                  <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] flex flex-col">
                    <div className="mb-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        <Dialog.Title className="text-sm font-sans text-foreground">
                          {getDayName(diaSemanaIdx)} {day.dayNumber}
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5 overflow-y-auto">
                      {turnosVisibles.map((t) => (
                        <div
                          key={t.id}
                          className={cn("flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors", getTurnoCls(t))}
                          onClick={() => { setModalOpen(false); onTurnoClick?.(t) }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setModalOpen(false)
                              onTurnoClick?.(t)
                            }
                          }}
                        >
                          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", getDotColor(t))} />
                          <span className="text-xs font-medium text-foreground">{t.horaInicio}</span>
                          <span className="text-xs text-muted-foreground truncate">{t.paciente.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        ) : (
          <>
            {visibles.map((t) => (
              <Tooltip key={t.id}>
                <TooltipTrigger render={
                  <div
                    className={cn("flex items-center gap-1 rounded-md px-2 py-1 min-w-0 cursor-pointer transition-colors", getTurnoCls(t))}
                    onClick={() => onTurnoClick?.(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTurnoClick?.(t) } }}
                  >
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", getDotColor(t))} />
                    <span className="truncate text-[10px] 2xl:text-[11px] leading-snug text-foreground">
                      {t.horaInicio} {t.paciente.nombre}
                    </span>
                  </div>
                } />
                <TooltipContent side="top">
                  {t.horaInicio} — {t.paciente.nombre}
                </TooltipContent>
              </Tooltip>
            ))}
            {hasManyTurnos && (
              <Tooltip>
                <TooltipTrigger render={
                  <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 min-w-0 cursor-default">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-muted-foreground" />
                    <span className="truncate text-[10px] 2xl:text-[11px] leading-snug text-muted-foreground">
                      +{restantes} más
                    </span>
                  </div>
                } />
                <TooltipContent side="bottom" align="start" className="bg-popover text-popover-foreground border border-border p-2">
                  <div className="space-y-1.5">
                    {turnosVisibles.slice(maxVisibles).map((t) => (
                      <div
                        key={t.id}
                        className={cn("flex items-center gap-1 text-[11px] whitespace-nowrap cursor-pointer rounded-md px-2 py-1 transition-opacity", getTurnoCls(t))}
                        onClick={() => onTurnoClick?.(t)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTurnoClick?.(t) } }}
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-sm", getDotColor(t))} />
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

  return card
}
