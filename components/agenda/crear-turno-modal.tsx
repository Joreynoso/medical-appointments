"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Search, Plus, X, Check, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Dialog } from "@base-ui/react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { crearTurno, getConfiguracionHoraria, getSlotsOcupadosEnFecha, type ConfigHoraria } from "@/lib/actions/turnos"
import { crearPaciente, listarPacientes } from "@/lib/actions/pacientes"
import { listarObrasSociales } from "@/lib/actions/obras-sociales"
import { getFeriadosEnRango } from "@/lib/actions/feriados"

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

type CrearTurnoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTurnoCreado: () => void
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function CrearTurnoModal({ open, onOpenChange, onTurnoCreado }: CrearTurnoModalProps) {
  const [fecha, setFecha] = useState<Date>()
  const [horaInicio, setHoraInicio] = useState("")
  const [busquedaPaciente, setBusquedaPaciente] = useState("")
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteSimple | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [config, setConfig] = useState<ConfigHoraria | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [feriados, setFeriados] = useState<Map<string, string>>(new Map())

  const [localPacientes, setLocalPacientes] = useState<PacienteSimple[]>([])
  const [localObrasSociales, setLocalObrasSociales] = useState<ObraSocialSimple[]>([])

  useEffect(() => {
    if (fecha) {
      const fechaStr = format(fecha, "yyyy-MM-dd")
      getSlotsOcupadosEnFecha(fechaStr).then(setOccupiedSlots).catch(() => setOccupiedSlots([]))
    } else {
      setOccupiedSlots([])
    }
  }, [fecha])

  const holidayDates = useMemo(() => {
    const dates: Date[] = []
    for (const fechaStr of feriados.keys()) {
      dates.push(new Date(fechaStr + "T00:00:00"))
    }
    return dates
  }, [feriados])

  const [showCrearPaciente, setShowCrearPaciente] = useState(false)
  const [nuevoPacienteNombre, setNuevoPacienteNombre] = useState("")
  const [nuevoPacienteTelefono, setNuevoPacienteTelefono] = useState("")
  const [nuevoPacienteObraSocialId, setNuevoPacienteObraSocialId] = useState("")
  const [creandoPaciente, setCreandoPaciente] = useState(false)

  useEffect(() => {
    if (open) {
      getConfiguracionHoraria()
        .then(setConfig)
        .catch(() => {})
      const año = new Date().getFullYear()
      Promise.all([getFeriadosEnRango(año), getFeriadosEnRango(año + 1)])
        .then(([actual, siguiente]) => {
          const map = new Map<string, string>()
          for (const f of [...actual, ...siguiente]) {
            map.set(f.fecha, f.nombre)
          }
          setFeriados(map)
        })
        .catch(() => setFeriados(new Map()))
      listarPacientes()
        .then((data) => {
          setLocalPacientes(data.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            telefono: p.telefono,
            obraSocialNombre: p.obraSocial?.nombre ?? null,
          })))
        })
        .catch(() => setLocalPacientes([]))
      listarObrasSociales()
        .then((data) => {
          setLocalObrasSociales(data.map((o) => ({ id: o.id, nombre: o.nombre })))
        })
        .catch(() => setLocalObrasSociales([]))
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
    ? localPacientes
    : localPacientes.filter((p) => normalize(p.nombre).includes(normalize(busquedaPaciente)))

  function resetForm() {
    setFecha(undefined)
    setHoraInicio("")
    setBusquedaPaciente("")
    setSelectedPaciente(null)
    setShowCrearPaciente(false)
    setNuevoPacienteNombre("")
    setNuevoPacienteTelefono("")
    setNuevoPacienteObraSocialId("")
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
      const paciente = await crearPaciente({
        nombre: nuevoPacienteNombre.trim(),
        telefono: nuevoPacienteTelefono.trim() || undefined,
        obraSocialId: nuevoPacienteObraSocialId || undefined,
      })
      const obraSocialSel = localObrasSociales.find((o) => o.id === nuevoPacienteObraSocialId)
      const nuevoPacienteSimple = {
        id: paciente.id,
        nombre: paciente.nombre,
        telefono: nuevoPacienteTelefono.trim() || null,
        obraSocialNombre: obraSocialSel?.nombre ?? null,
      }
      setSelectedPaciente(nuevoPacienteSimple)
      setLocalPacientes((prev) => [...prev, nuevoPacienteSimple])
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
              <Dialog.Title className="text-lg font-sans text-foreground">
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
                      locale={es}
                      onSelect={(date) => {
                        setFecha(date)
                        setPopoverOpen(false)
                      }}
                      disabled={(date) => {
                        const hoy = new Date(new Date().setHours(0, 0, 0, 0))
                        if (date < hoy) return true
                        if (date.getDay() === 0) return true
                        if (!config?.diasLaborables.includes(date.getDay())) return true
                        return false
                      }}
                      defaultMonth={fecha ?? new Date()}
                      modifiers={{ feriado: holidayDates }}
                      modifiersClassNames={{ feriado: "!text-destructive" }}
                      components={{
                        DayButton: (props) => {
                          const key = format(props.day.date, "yyyy-MM-dd")
                          const nombre = feriados.get(key)
                          return (
                            <CalendarDayButton
                              locale={es}
                              title={nombre || undefined}
                              {...props}
                            />
                          )
                        },
                      }}
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
                      {(() => {
                        const slotsDisponibles = generarSlots().filter((slot) => {
                          if (occupiedSlots.includes(slot)) return false
                          if (!fecha) return true
                          const hoy = new Date()
                          const hoyStr = format(hoy, "yyyy-MM-dd")
                          if (format(fecha, "yyyy-MM-dd") !== hoyStr) return true
                          const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes()
                          const [h, m] = slot.split(":").map(Number)
                          return h * 60 + m > ahoraMin
                        })
                        if (slotsDisponibles.length === 0) {
                          return (
                            <option value="">
                              {fecha ? "El horario de atención ha terminado" : "Seleccionar fecha primero"}
                            </option>
                          )
                        }
                        return (
                          <>
                            <option value="">Seleccionar hora</option>
                            {slotsDisponibles.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </>
                        )
                      })()}
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
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="nuevo-nombre" className="text-xs font-medium text-foreground">
                        Nombre <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="nuevo-nombre"
                        type="text"
                        placeholder="Nombre completo"
                        value={nuevoPacienteNombre}
                        onChange={(e) => setNuevoPacienteNombre(e.target.value)}
                        disabled={creandoPaciente}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="nuevo-telefono" className="text-xs font-medium text-foreground">
                        Teléfono
                      </label>
                      <input
                        id="nuevo-telefono"
                        type="tel"
                        placeholder="+54 11 1234-5678"
                        value={nuevoPacienteTelefono}
                        onChange={(e) => setNuevoPacienteTelefono(e.target.value)}
                        disabled={creandoPaciente}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="nuevo-obra-social" className="text-xs font-medium text-foreground">
                        Obra Social
                      </label>
                      <select
                        id="nuevo-obra-social"
                        value={nuevoPacienteObraSocialId}
                        onChange={(e) => setNuevoPacienteObraSocialId(e.target.value)}
                        disabled={creandoPaciente}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                      >
                        <option value="">Sin obra social</option>
                        {localObrasSociales.map((os) => (
                          <option key={os.id} value={os.id}>
                            {os.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        disabled={!nuevoPacienteNombre.trim() || creandoPaciente}
                        onClick={handleCrearPaciente}
                      >
                        {creandoPaciente ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Crear paciente
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={creandoPaciente}
                        onClick={() => setShowCrearPaciente(false)}
                      >
                        Volver
                      </Button>
                    </div>
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
                              setSelectedPaciente({
                                id: p.id,
                                nombre: p.nombre,
                                telefono: p.telefono,
                                obraSocialNombre: p.obraSocialNombre,
                              })
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
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground">
                            {selectedPaciente.nombre}
                          </span>
                          {(selectedPaciente.telefono || selectedPaciente.obraSocialNombre) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {[selectedPaciente.telefono, selectedPaciente.obraSocialNombre].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPaciente(null)}
                          className="text-muted-foreground hover:text-foreground"
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
