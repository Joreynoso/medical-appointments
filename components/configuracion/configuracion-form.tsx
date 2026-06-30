"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { actualizarConfiguracion, type ConfiguracionData } from "@/lib/actions/configuracion"

const DIAS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
]

const HORAS = Array.from({ length: 17 }, (_, i) => {
  const h = 6 + i
  return `${String(h).padStart(2, "0")}:00`
})

const DURACIONES = [15, 30]

type ConfiguracionFormProps = {
  initialConfig: ConfiguracionData | null
}

export function ConfiguracionForm({ initialConfig }: ConfiguracionFormProps) {
  const [duracionSlot, setDuracionSlot] = useState(initialConfig?.duracionSlot ?? 30)
  const [horarioDesde, setHorarioDesde] = useState(initialConfig?.horarioDesde ?? "08:00")
  const [horarioHasta, setHorarioHasta] = useState(initialConfig?.horarioHasta ?? "19:00")
  const [diasLaborables, setDiasLaborables] = useState<number[]>(initialConfig?.diasLaborables ?? [1, 2, 3, 4, 5, 6])
  const [submitting, setSubmitting] = useState(false)

  function toggleDia(dia: number) {
    setDiasLaborables((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia].sort()
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await actualizarConfiguracion({ duracionSlot, horarioDesde, horarioHasta, diasLaborables })
    if (result.success) {
      toast.success("Configuración guardada")
    } else {
      toast.error(result.error)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border border-border p-4 sm:p-6">
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Días laborables</h2>
        <p className="text-xs text-muted-foreground">
          Seleccioná los días que atendés. Los domingos no están disponibles.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DIAS.map((dia) => {
            const active = diasLaborables.includes(dia.value)
            return (
              <button
                key={dia.value}
                type="button"
                onClick={() => toggleDia(dia.value)}
                className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {dia.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Horario de atención</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="desde" className="text-xs text-muted-foreground">Desde</label>
            <select
              id="desde"
              value={horarioDesde}
              onChange={(e) => setHorarioDesde(e.target.value)}
              disabled={submitting}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
            >
              {HORAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="hasta" className="text-xs text-muted-foreground">Hasta</label>
            <select
              id="hasta"
              value={horarioHasta}
              onChange={(e) => setHorarioHasta(e.target.value)}
              disabled={submitting}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
            >
              {HORAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Duración del turno</h2>
        <div className="space-y-1.5">
          <select
            value={duracionSlot}
            onChange={(e) => setDuracionSlot(Number(e.target.value))}
            disabled={submitting}
            className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
          >
            {DURACIONES.map((d) => (
              <option key={d} value={d}>{d} minutos</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            No se puede cambiar si hay turnos pendientes o confirmados a futuro.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-4" />
            Guardar cambios
          </>
        )}
      </button>
    </form>
  )
}
