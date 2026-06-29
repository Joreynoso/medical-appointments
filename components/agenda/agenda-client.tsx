"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { MonthView } from "@/components/agenda/month-view"
import { WeekView } from "@/components/agenda/week-view"
import { CalendarToolbar } from "@/components/agenda/calendar-toolbar"
import { DetalleTurnoModal } from "@/components/agenda/detalle-turno-modal"
import { FilterModal, type FilterState } from "@/components/agenda/filter-modal"
import { usePageHeaderActions } from "@/components/dashboard/page-header-context"
import { useCrearTurno } from "@/components/agenda/crear-turno-context"
import { addMonths, addWeeks, formatDateKey } from "@/components/agenda/calendar-utils"
import { getFeriadosEnRango } from "@/lib/actions/feriados"
import { getTurnosEnRango, cambiarEstadoTurno } from "@/lib/actions/turnos"
import type { TurnoData, ConfigHoraria } from "@/lib/actions/turnos"

type PacienteSimple = {
  id: string
  nombre: string
  telefono: string | null
  obraSocialNombre: string | null
}

type ObraSocialSimple = {
  id: string
  nombre: string
}

type AgendaClientProps = {
  initialFeriados: Array<{ fecha: string; nombre: string }>
  initialTurnos: TurnoData[]
  initialPacientes: PacienteSimple[]
  initialObrasSociales: ObraSocialSimple[]
  horarioDesde: string
  horarioHasta: string
  diasLaborables: number[]
}

export function AgendaClient({ initialFeriados, initialTurnos, initialPacientes, initialObrasSociales, horarioDesde, horarioHasta, diasLaborables }: AgendaClientProps) {
  const { setPacientes, setObrasSociales, setRefreshRange, setOnTurnosChange } = useCrearTurno()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const loadedRange = useRef<{ desde: string; hasta: string }>({ desde: "", hasta: "" })
  const [feriados, setFeriados] = useState(() => {
    const map = new Map<string, string>()
    for (const f of initialFeriados) {
      map.set(f.fecha, f.nombre)
    }
    return map
  })
  const [turnos, setTurnos] = useState<TurnoData[]>(initialTurnos)
  const [selectedTurno, setSelectedTurno] = useState<TurnoData | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    pacienteQuery: "",
    estado: null,
  })

  const turnosFiltrados = useMemo(() => {
    let filtered = turnos
    if (filters.pacienteQuery) {
      const q = filters.pacienteQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      filtered = filtered.filter((t) =>
        t.paciente.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(q),
      )
    }
    if (filters.estado) {
      filtered = filtered.filter((t) => t.estado === filters.estado)
    }
    return filtered
  }, [turnos, filters])

  const turnosPorFecha = useMemo(() => {
    const map = new Map<string, TurnoData[]>()
    for (const t of turnosFiltrados) {
      const existing = map.get(t.fecha) ?? []
      existing.push(t)
      map.set(t.fecha, existing)
    }
    return map
  }, [turnosFiltrados, currentDate])

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

  const ensureTurnos = useCallback(async (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const desde = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const hasta = new Date(year, month + 2, 0).toISOString().slice(0, 10)

    if (loadedRange.current.desde <= desde && loadedRange.current.hasta >= hasta) return

    const data = await getTurnosEnRango(desde, hasta)
    setTurnos((prev) => {
      const existing = new Map<string, TurnoData>()
      for (const t of prev) existing.set(t.id, t)
      for (const t of data) existing.set(t.id, t)
      return Array.from(existing.values())
    })
    loadedRange.current = { desde, hasta }
  }, [])

  const handlePrev = useCallback(() => {
    const next = viewMode === "month" ? addMonths(currentDate, -1) : addWeeks(currentDate, -1)
    ensureFeriados(next.getFullYear())
    ensureTurnos(next)
    setCurrentDate(next)
  }, [currentDate, viewMode, ensureFeriados, ensureTurnos])

  const handleNext = useCallback(() => {
    const next = viewMode === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1)
    ensureFeriados(next.getFullYear())
    ensureTurnos(next)
    setCurrentDate(next)
  }, [currentDate, viewMode, ensureFeriados, ensureTurnos])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleViewChange = useCallback((mode: "month" | "week") => {
    setViewMode(mode)
    setCurrentDate(new Date())
  }, [])

  const handleTurnoUpdated = useCallback(async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const desde = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const hasta = new Date(year, month + 2, 0).toISOString().slice(0, 10)
    const data = await getTurnosEnRango(desde, hasta)
    setTurnos((prev) => {
      const map = new Map<string, TurnoData>()
      for (const t of prev) map.set(t.id, t)
      for (const t of data) map.set(t.id, t)
      return Array.from(map.values())
    })
    loadedRange.current = { desde, hasta }
  }, [currentDate])

  const handleTurnoClick = useCallback(async (turno: TurnoData) => {
    const hoy = new Date().toISOString().slice(0, 10)
    if (turno.estado === "PENDIENTE" && turno.fecha < hoy) {
      await cambiarEstadoTurno(turno.id, "AUSENTE")
      await handleTurnoUpdated()
      return
    }
    setSelectedTurno(turno)
    setDetailModalOpen(true)
  }, [handleTurnoUpdated])

  const { setActions } = usePageHeaderActions()

  useEffect(() => {
    setPacientes(initialPacientes)
    setObrasSociales(initialObrasSociales)
  }, [initialPacientes, setPacientes, initialObrasSociales, setObrasSociales])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const desde = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const hasta = new Date(year, month + 2, 0).toISOString().slice(0, 10)
    setRefreshRange(desde, hasta)
  }, [currentDate, setRefreshRange])

  useEffect(() => {
    setOnTurnosChange((turnos) => setTurnos(turnos))
  }, [setOnTurnosChange])

  useEffect(() => {
    setActions(
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onFilterClick={() => setFilterOpen(true)}
        filterActive={!!(filters.pacienteQuery || filters.estado)}
        onViewChange={handleViewChange}
      />,
    )
    return () => setActions(null)
  }, [currentDate, viewMode, handlePrev, handleNext, handleToday, filters, setActions])

  return (
    <>
    <div className="space-y-6">
      {viewMode === "month" ? (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          feriados={feriados}
          turnosPorFecha={turnosPorFecha}
          diasLaborables={diasLaborables}
          onTurnoClick={handleTurnoClick}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          feriados={feriados}
          turnosPorFecha={turnosPorFecha}
          horarioDesde={horarioDesde}
          horarioHasta={horarioHasta}
          diasLaborables={diasLaborables}
          onTurnoClick={handleTurnoClick}
        />
      )}
    </div>
      <DetalleTurnoModal
        turno={selectedTurno}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open)
          if (!open) setSelectedTurno(null)
        }}
        onStatusChanged={handleTurnoUpdated}
      />
      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        allTurnos={turnos}
      />
    </>
  )
}
