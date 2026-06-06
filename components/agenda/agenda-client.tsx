"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { MonthView } from "@/components/agenda/month-view"
import { WeekView } from "@/components/agenda/week-view"
import { CalendarToolbar } from "@/components/agenda/calendar-toolbar"
import { usePageHeaderActions } from "@/components/dashboard/page-header-context"
import { addMonths, addWeeks } from "@/components/agenda/calendar-utils"
import { getFeriadosEnRango } from "@/lib/actions/feriados"
import type { TurnoData } from "@/lib/actions/turnos"

type AgendaClientProps = {
  initialFeriados: Array<{ fecha: string; nombre: string }>
  initialTurnos: TurnoData[]
}

export function AgendaClient({ initialFeriados, initialTurnos }: AgendaClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [feriados, setFeriados] = useState(() => {
    const map = new Map<string, string>()
    for (const f of initialFeriados) {
      map.set(f.fecha, f.nombre)
    }
    return map
  })
  const [turnos, setTurnos] = useState<TurnoData[]>(initialTurnos)

  const turnosPorFecha = useMemo(() => {
    const map = new Map<string, TurnoData[]>()
    for (const t of turnos) {
      const existing = map.get(t.fecha) ?? []
      existing.push(t)
      map.set(t.fecha, existing)
    }
    return map
  }, [turnos])

  const ensureFeriados = useCallback(async (year: number) => {
    if (!feriados.has(`${year}-01-01`)) {
      const data = await getFeriadosEnRango(year)
      setFeriados((prev) => {
        const next = new Map(prev)
        for (const f of data) {
          next.set(f.fecha, f.nombre)
        }
        return next
      })
    }
  }, [feriados])

  const handlePrev = useCallback(() => {
    const next = viewMode === "month" ? addMonths(currentDate, -1) : addWeeks(currentDate, -1)
    ensureFeriados(next.getFullYear())
    setCurrentDate(next)
  }, [currentDate, viewMode, ensureFeriados])

  const handleNext = useCallback(() => {
    const next = viewMode === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1)
    ensureFeriados(next.getFullYear())
    setCurrentDate(next)
  }, [currentDate, viewMode, ensureFeriados])

  const handleToday = useCallback(() => {
    const today = new Date()
    ensureFeriados(today.getFullYear())
    setCurrentDate(today)
  }, [ensureFeriados])

  const { setActions } = usePageHeaderActions()

  useEffect(() => {
    setActions(
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setViewMode}
      />,
    )
    return () => setActions(null)
  }, [currentDate, viewMode, handlePrev, handleNext, handleToday, setActions])

  return (
    <div className="space-y-6">
      {viewMode === "month" ? (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          feriados={feriados}
          turnosPorFecha={turnosPorFecha}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          feriados={feriados}
          turnosPorFecha={turnosPorFecha}
        />
      )}
    </div>
  )
}
