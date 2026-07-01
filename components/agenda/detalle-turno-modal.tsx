"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { X, Loader2, CalendarDays, Clock, User, Phone, FileText, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog } from "@base-ui/react"
import { Button } from "@/components/ui/button"
import { cambiarEstadoTurno } from "@/lib/actions/turnos"
import { esTurnoPasado } from "@/components/agenda/calendar-utils"
import type { TurnoData } from "@/lib/actions/turnos"

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  AUSENTE: "Ausente",
}

const badgePasado = "bg-muted/60 text-muted-foreground border-muted-foreground/30"

const estadoBadge: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/20 text-yellow-600 border-yellow-500/60",
  CONFIRMADO: "bg-green-500/20 text-green-600 border-green-500/60",
  CANCELADO: "bg-destructive/20 text-destructive border-destructive/60",
  AUSENTE: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/60",
}

type DetalleTurnoModalProps = {
  turno: TurnoData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChanged: () => void
}

export function DetalleTurnoModal({ turno, open, onOpenChange, onStatusChanged }: DetalleTurnoModalProps) {
  const [accionando, setAccionando] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  if (!turno) return null

  const turnoData = turno
  const fechaDate = new Date(turnoData.fecha + "T00:00:00")
  const diaSemana = fechaDate.getDay()
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  async function ejecutarCambioEstado(nuevoEstado: "CONFIRMADO" | "CANCELADO" | "AUSENTE") {
    setAccionando(true)
    try {
      await cambiarEstadoTurno(turnoData.id, nuevoEstado)
      const accion = nuevoEstado === "CONFIRMADO" ? "confirmado" : nuevoEstado === "CANCELADO" ? "cancelado" : "marcado como ausente"
      toast.success(`Turno ${accion}`)
      setConfirmingCancel(false)
      onOpenChange(false)
      onStatusChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado")
    } finally {
      setAccionando(false)
    }
  }

  function cerrar() {
    setConfirmingCancel(false)
    onOpenChange(false)
  }

  const esPasado = esTurnoPasado(turnoData.fecha, turnoData.horaFin)
  const mostrarConfirmar = (turnoData.estado === "PENDIENTE" || turnoData.estado === "CANCELADO" || turnoData.estado === "AUSENTE") && !esPasado
  const mostrarCancelar = (turnoData.estado === "PENDIENTE" || turnoData.estado === "CONFIRMADO") && !esPasado
  const mostrarAusente = turnoData.estado === "CONFIRMADO" && !esPasado
  const tieneAcciones = mostrarConfirmar || mostrarCancelar || mostrarAusente

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) cerrar() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-lg font-sans text-foreground">
                Detalle del turno
              </Dialog.Title>
              <button
                type="button"
                onClick={cerrar}
                disabled={accionando}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Turno
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {diasSemana[diaSemana]}, {format(fechaDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {turnoData.horaInicio} — {turnoData.horaFin}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium", esPasado ? badgePasado : estadoBadge[turnoData.estado])}>
                    {estadoLabel[turnoData.estado]}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paciente
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{turnoData.paciente.nombre}</span>
                </div>
                {turnoData.paciente.telefono && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    <span>{turnoData.paciente.telefono}</span>
                  </div>
                )}
                {turnoData.paciente.notas && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FileText className="mt-0.5 size-4 shrink-0" />
                    <span>{turnoData.paciente.notas}</span>
                  </div>
                )}
              </div>

              {confirmingCancel ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Cancelar turno</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ¿Estás seguro de cancelar el turno de <span className="font-medium text-foreground">{turnoData.paciente.nombre}</span> del {diasSemana[diaSemana]} {format(fechaDate, "d 'de' MMMM", { locale: es })} a las {turnoData.horaInicio}?
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                          variant="outline"
                          disabled={accionando}
                          onClick={() => setConfirmingCancel(false)}
                          className="w-full sm:w-auto"
                        >
                          Volver
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={accionando}
                          onClick={() => ejecutarCambioEstado("CANCELADO")}
                          className="w-full sm:w-auto"
                        >
                          {accionando ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Cancelando...
                            </>
                          ) : (
                            "Sí, cancelar turno"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                tieneAcciones && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    {mostrarCancelar && (
                      <Button
                        variant="outline"
                        disabled={accionando}
                        onClick={() => setConfirmingCancel(true)}
                        className="w-full sm:w-auto"
                      >
                        <AlertTriangle className="size-4 text-destructive" />
                        Cancelar turno
                      </Button>
                    )}
                    {mostrarAusente && (
                      <Button
                        variant="outline"
                        disabled={accionando}
                        onClick={() => ejecutarCambioEstado("AUSENTE")}
                        className="w-full sm:w-auto"
                      >
                        Marcar ausente
                      </Button>
                    )}
                    {mostrarConfirmar && (
                      <Button disabled={accionando} onClick={() => ejecutarCambioEstado("CONFIRMADO")} className="w-full sm:w-auto">
                        {accionando ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Confirmando...
                          </>
                        ) : (
                          "Confirmar turno"
                        )}
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
