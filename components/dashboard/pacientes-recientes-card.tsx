"use client"

import { useState } from "react"
import { Plus, Loader2, Phone } from "lucide-react"
import { Dialog } from "@base-ui/react"
import { toast } from "sonner"
import { crearPaciente, listarPacientes } from "@/lib/actions/pacientes"
import { Button } from "@/components/ui/button"
import type { PacienteListData } from "@/lib/actions/pacientes"
import type { ObraSocialListData } from "@/lib/actions/obras-sociales"

type PacientesRecientesCardProps = {
  initialPacientes: PacienteListData[]
  obrasSociales: ObraSocialListData[]
}

export function PacientesRecientesCard({ initialPacientes, obrasSociales }: PacientesRecientesCardProps) {
  const [pacientes, setPacientes] = useState(initialPacientes)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      const nombre = formData.get("nombre") as string
      if (!nombre?.trim()) {
        toast.error("El nombre es obligatorio")
        return
      }
      const telefono = formData.get("telefono") as string
      const notas = formData.get("notas") as string
      const obraSocialId = formData.get("obraSocialId") as string

      await crearPaciente({
        nombre: nombre.trim(),
        telefono: telefono?.trim() || undefined,
        notas: notas?.trim() || undefined,
        obraSocialId: obraSocialId || undefined,
      })
      const actualizados = await listarPacientes()
      setPacientes(actualizados)
      toast.success("Paciente creado")
      setModalOpen(false)
    } catch {
      toast.error("Error al crear paciente")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5 h-full">
      <div className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between shrink-0 gap-4">
        <h3 className="text-lg font-serif text-foreground">
          Pacientes recientes
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="size-3.5" />
          Nuevo paciente
        </Button>
      </div>

      {pacientes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No hay pacientes registrados
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {pacientes.slice(0, 7).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="size-2 shrink-0 rounded-full bg-primary/60" />
              <span className="flex-1 text-sm text-foreground truncate">
                {p.nombre}
              </span>
              {p.telefono && (
                <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                  <Phone className="size-3" />
                  {p.telefono}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center shrink-0">
        <a
          href="/dashboard/pacientes"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Ver todos los pacientes
        </a>
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed inset-0 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <Dialog.Title className="text-lg font-serif text-foreground">
                  Nuevo paciente
                </Dialog.Title>
                <button type="button" onClick={() => setModalOpen(false)} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form action={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium text-foreground">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    disabled={submitting}
                    placeholder="Nombre completo"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="text-sm font-medium text-foreground">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    disabled={submitting}
                    placeholder="+54 11 1234-5678"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="obraSocialId" className="text-sm font-medium text-foreground">
                    Obra Social
                  </label>
                  <select
                    id="obraSocialId"
                    name="obraSocialId"
                    disabled={submitting}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  >
                    <option value="">Sin obra social</option>
                    {obrasSociales.map((os) => (
                      <option key={os.id} value={os.id}>
                        {os.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="notas" className="text-sm font-medium text-foreground">
                    Notas <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <textarea
                    id="notas"
                    name="notas"
                    rows={3}
                    disabled={submitting}
                    placeholder="Notas internas..."
                    className="w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" disabled={submitting} onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Crear paciente"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
