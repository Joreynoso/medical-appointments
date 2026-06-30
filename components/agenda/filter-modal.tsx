"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog } from "@base-ui/react"
import { Button } from "@/components/ui/button"
import type { TurnoData } from "@/lib/actions/turnos"

const ESTADOS = ["PENDIENTE", "CONFIRMADO", "AUSENTE"] as const

export type FilterState = {
  pacienteQuery: string
  estado: "PENDIENTE" | "CONFIRMADO" | "AUSENTE" | null
}

type FilterModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  allTurnos: TurnoData[]
}

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  AUSENTE: "Ausente",
}

const estadoBullet: Record<string, string> = {
  PENDIENTE: "bg-ring",
  CONFIRMADO: "bg-primary",
  AUSENTE: "bg-muted-foreground",
}

const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

function formatFecha(fecha: string): string {
  const d = new Date(fecha + "T00:00:00")
  return `${diasSemana[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

export function FilterModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  allTurnos,
}: FilterModalProps) {
  const [localPaciente, setLocalPaciente] = useState(filters.pacienteQuery)
  const [localEstado, setLocalEstado] = useState(filters.estado)

  useEffect(() => {
    if (open) {
      setLocalPaciente(filters.pacienteQuery)
      setLocalEstado(filters.estado)
    }
  }, [open, filters])

  const filteredTurnos = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    let list = allTurnos.filter((t) => t.fecha >= hoy)
    if (localPaciente) {
      const q = localPaciente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      list = list.filter((t) =>
        t.paciente.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(q),
      )
    }
    if (localEstado) {
      list = list.filter((t) => t.estado === localEstado)
    } else {
      list = list.filter((t) => t.estado !== "CANCELADO")
    }
    return [...list].sort((a, b) =>
      a.fecha === b.fecha
        ? a.horaInicio.localeCompare(b.horaInicio)
        : a.fecha.localeCompare(b.fecha),
    )
  }, [allTurnos, localPaciente, localEstado])

  function handleClear() {
    setLocalPaciente("")
    setLocalEstado(null)
    onFiltersChange({ pacienteQuery: "", estado: null })
  }

  function applyFilters(nextPaciente: string, nextEstado: typeof localEstado) {
    setLocalPaciente(nextPaciente)
    setLocalEstado(nextEstado)
    onFiltersChange({ pacienteQuery: nextPaciente, estado: nextEstado })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex w-full max-w-md flex-col rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between shrink-0">
              <Dialog.Title className="text-lg font-sans text-foreground">
                Filtros
              </Dialog.Title>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5 shrink-0">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Paciente
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={localPaciente}
                    onChange={(e) => applyFilters(e.target.value, localEstado)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Estado del turno
                </label>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((estado) => {
                    const active = localEstado === estado
                    return (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => {
                          const next = localEstado === estado ? null : estado
                          applyFilters(localPaciente, next)
                        }}
                        className={`h-9 rounded-lg border px-4 text-sm font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {estadoLabel[estado]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1">
              {filteredTurnos.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-border px-3 py-8 text-sm text-muted-foreground">
                  No se encontraron turnos
                </div>
              ) : (
                <div className="max-h-48 md:max-h-64 overflow-y-auto rounded-lg border border-border">
                  {filteredTurnos.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted border-b border-border last:border-b-0"
                    >
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", estadoBullet[t.estado])} />
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {t.paciente.nombre}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatFecha(t.fecha)}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {t.horaInicio}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {filteredTurnos.length} turno{filteredTurnos.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={handleClear}>
                <RotateCcw className="size-3.5" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
