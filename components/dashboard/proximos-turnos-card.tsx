"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCrearTurno } from "@/components/agenda/crear-turno-context"
import type { TurnoData } from "@/lib/actions/turnos"

type ProximosTurnosCardProps = {
  turnos: TurnoData[]
}

function formatearFecha(fecha: string): string {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const [, m, d] = fecha.split("-").map(Number)
  return `${meses[m - 1]} ${d}`
}

const colorEstado: Record<string, string> = {
  PENDIENTE: "bg-amber-400",
  CONFIRMADO: "bg-emerald-500",
  AUSENTE: "bg-gray-400",
}

export function ProximosTurnosCard({ turnos }: ProximosTurnosCardProps) {
  const { openCrearTurno } = useCrearTurno()

  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <h3 className="text-lg font-serif text-foreground">
          Próximos turnos
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openCrearTurno}
        >
          <Plus className="size-3.5" />
          Agregar turno
        </Button>
      </div>
      <div className="flex-1 min-h-0 max-h-[200px] overflow-y-auto">
        {turnos.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">
              No hay turnos próximos
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {turnos.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
              >
                <span className={`size-2 shrink-0 rounded-full ${colorEstado[t.estado] ?? "bg-gray-400"}`} />
                <span className="flex-1 text-sm text-foreground truncate">
                  {t.paciente.nombre}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatearFecha(t.fecha)}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                  {t.horaInicio}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
