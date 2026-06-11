"use client"

import { useState, useEffect } from "react"
import { Loader2, Search, Plus, X, Check, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Dialog } from "@base-ui/react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { crearTurno, getConfiguracionHoraria } from "@/lib/actions/turnos"
import { crearPaciente } from "@/lib/actions/pacientes"

type PacienteSimple = {
  id: string
  nombre: string
}

type CrearTurnoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacientes: PacienteSimple[]
  onTurnoCreado: () => void
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function CrearTurnoModal({ open, onOpenChange, pacientes, onTurnoCreado }: CrearTurnoModalProps) {
  const [fecha, setFecha] = useState<Date>()
  const [horaInicio, setHoraInicio] = useState("")
  const [busquedaPaciente, setBusquedaPaciente] = useState("")
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteSimple | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [config, setConfig] = useState<{ horarioDesde: string; horarioHasta: string; duracionSlot: number } | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [showCrearPaciente, setShowCrearPaciente] = useState(false)
  const [nuevoPacienteNombre, setNuevoPacienteNombre] = useState("")
  const [creandoPaciente, setCreandoPaciente] = useState(false)

  useEffect(() => {
    if (open) {
      getConfiguracionHoraria()
        .then(setConfig)
        .catch(() => {})
    }
  }, [open])

  function generarSlots() {
    if (!config) return []
    const [hDesde, mDesde] = config.horarioDesde.split(":").map(Number)
    const [hHasta, mHasta] = config.horarioHasta.split(":").map(Number)
    const inicio = hDesde * 60 + mDesde
    const fin = hHasta * 60 + mHasta
    const slots: string[] = []
    for (let m = inicio; m < fin; m += config.duracionSlot) {
      slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`)
    }
    return slots
  }

  const filteredPacientes = !busquedaPaciente
    ? pacientes
    : pacientes.filter((p) => normalize(p.nombre).includes(normalize(busquedaPaciente)))

  function resetForm() {
    setFecha(undefined)
    setHoraInicio("")
    setBusquedaPaciente("")
    setSelectedPaciente(null)
    setShowCrearPaciente(false)
    setNuevoPacienteNombre("")
    setPopoverOpen(false)
  }

  function cerrar() {
    resetForm()
    onOpenChange(false)
  }

  async function handleCrearPaciente() {
    if (!nuevoPacienteNombre.trim()) return
    setCreandoPaciente(true)
    try {
      const paciente = await crearPaciente({ nombre: nuevoPacienteNombre.trim() })
      setSelectedPaciente({ id: paciente.id, nombre: paciente.nombre })
      setShowCrearPaciente(false)
      setNuevoPacienteNombre("")
      setBusquedaPaciente("")
      toast.success("Paciente creado")
    } catch {
      toast.error("Error al crear paciente")
    } finally {
      setCreandoPaciente(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fecha || !horaInicio || !selectedPaciente) {
      toast.error("Completá todos los campos requeridos")
      return
    }
    setSubmitting(true)
    try {
      const fechaStr = format(fecha, "yyyy-MM-dd")
      await crearTurno({
        fecha: fechaStr,
        horaInicio,
        pacienteId: selectedPaciente.id,
      })
      toast.success("Turno creado")
      resetForm()
      onOpenChange(false)
      onTurnoCreado()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear turno")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-lg font-serif text-foreground">
                Nuevo turno
              </Dialog.Title>
              <button type="button" onClick={cerrar} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Fecha <span className="text-destructive">*</span>
                </label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={submitting}
                      />
                    }
                  >
                    {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    <CalendarIcon className="ml-auto size-4 text-primary" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => {
                        setFecha(date)
                        setPopoverOpen(false)
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      defaultMonth={fecha ?? new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="hora" className="text-sm font-medium text-foreground">
                  Hora de inicio <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="hora"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    disabled={submitting || !config}
                    className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  >
                    <option value="">Seleccionar hora</option>
                    {generarSlots().map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <Clock
                    className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-primary"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Paciente <span className="text-destructive">*</span>
                </label>
                {showCrearPaciente ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del paciente"
                        value={nuevoPacienteNombre}
                        onChange={(e) => setNuevoPacienteNombre(e.target.value)}
                        disabled={creandoPaciente}
                        className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        disabled={!nuevoPacienteNombre.trim() || creandoPaciente}
                        onClick={handleCrearPaciente}
                      >
                        {creandoPaciente ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={creandoPaciente}
                        onClick={() => setShowCrearPaciente(false)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ingresá el nombre y confirmá para crear el paciente al instante.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={busquedaPaciente}
                        onChange={(e) => setBusquedaPaciente(e.target.value)}
                        disabled={submitting}
                        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                      {filteredPacientes.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          {busquedaPaciente ? "No se encontraron pacientes" : "No hay pacientes disponibles"}
                        </div>
                      ) : (
                        filteredPacientes.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPaciente(p)
                              setBusquedaPaciente("")
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                              selectedPaciente?.id === p.id
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {p.nombre}
                          </button>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCrearPaciente(true)}
                        className="w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-muted"
                      >
                        <Plus className="mr-1.5 inline size-3.5" />
                        Crear nuevo paciente
                      </button>
                    </div>
                    {selectedPaciente && !busquedaPaciente && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <span className="text-sm font-medium text-foreground">
                          {selectedPaciente.nombre}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedPaciente(null)}
                          className="ml-auto text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" disabled={submitting} onClick={cerrar}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting || !selectedPaciente}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear turno"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
