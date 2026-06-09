"use client"

import { useState, useCallback } from "react"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, AlertDialog } from "@base-ui/react"
import {
  listarPacientes,
  crearPaciente,
  actualizarPaciente,
  desactivarPaciente,
} from "@/lib/actions/pacientes"
import type { PacienteListData } from "@/lib/actions/pacientes"

type ModalMode = "crear" | "editar" | null

type PacientesClientProps = {
  initialPacientes: PacienteListData[]
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function PacientesClient({ initialPacientes }: PacientesClientProps) {
  const [pacientes, setPacientes] = useState<PacienteListData[]>(initialPacientes)
  const [busqueda, setBusqueda] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteListData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pacienteToDelete, setPacienteToDelete] = useState<PacienteListData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const filteredPacientes = !busqueda
    ? pacientes
    : pacientes.filter((p) => normalize(p.nombre).includes(normalize(busqueda)))

  const cargarPacientes = useCallback(async () => {
    try {
      const data = await listarPacientes()
      setPacientes(data)
    } catch {
      toast.error("Error al cargar pacientes")
    }
  }, [])

  function abrirCrear() {
    setModalMode("crear")
    setSelectedPaciente(null)
    setModalOpen(true)
  }

  function abrirEditar(paciente: PacienteListData) {
    setModalMode("editar")
    setSelectedPaciente(paciente)
    setModalOpen(true)
  }

  function cerrarModal() {
    setModalOpen(false)
    setModalMode(null)
    setSelectedPaciente(null)
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      const nombre = formData.get("nombre") as string
      const telefono = formData.get("telefono") as string

      if (!nombre?.trim()) {
        toast.error("El nombre es obligatorio")
        return
      }

      if (modalMode === "crear") {
        await crearPaciente({ nombre: nombre.trim(), telefono: telefono?.trim() || undefined })
        toast.success("Paciente creado")
      } else if (modalMode === "editar" && selectedPaciente) {
        const notas = formData.get("notas") as string
        await actualizarPaciente(selectedPaciente.id, {
          nombre: nombre.trim(),
          telefono: telefono?.trim() || undefined,
          notas: notas?.trim() || undefined,
        })
        toast.success("Paciente actualizado")
      }
      cerrarModal()
      cargarPacientes()
    } catch {
      toast.error("Error al guardar paciente")
    } finally {
      setSubmitting(false)
    }
  }

  function confirmarEliminar(paciente: PacienteListData) {
    setPacienteToDelete(paciente)
    setDeleteDialogOpen(true)
  }

  async function handleEliminar() {
    if (!pacienteToDelete) return
    try {
      await desactivarPaciente(pacienteToDelete.id)
      toast.success("Paciente desactivado")
      setDeleteDialogOpen(false)
      setPacienteToDelete(null)
      cargarPacientes()
    } catch {
      toast.error("Error al desactivar paciente")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
          />
        </div>
        <Button size="lg" onClick={abrirCrear}>
          <Plus className="size-4" />
          Nuevo paciente
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        {filteredPacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {busqueda ? "No se encontraron pacientes" : "No hay pacientes registrados"}
            </p>
            {!busqueda && (
              <Button variant="outline" className="mt-4" onClick={abrirCrear}>
                <Plus className="size-4" />
                Crear primer paciente
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id} className="group hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {paciente.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {paciente.telefono || "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-muted-foreground">
                    {paciente.notas || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => abrirEditar(paciente)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => confirmarEliminar(paciente)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
          <Dialog.Popup className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <Dialog.Title className="text-lg font-serif text-foreground">
                  {modalMode === "crear" ? "Nuevo paciente" : "Editar paciente"}
                </Dialog.Title>
                <button type="button" onClick={cerrarModal} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-foreground">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    defaultValue={selectedPaciente?.nombre ?? ""}
                    placeholder="Nombre completo"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-medium text-foreground">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    defaultValue={selectedPaciente?.telefono ?? ""}
                    placeholder="+54 11 1234-5678"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
                  />
                </div>
                {modalMode === "editar" && (
                  <div className="space-y-2">
                    <label htmlFor="notas" className="text-sm font-medium text-foreground">
                      Notas
                    </label>
                    <textarea
                      id="notas"
                      name="notas"
                      rows={3}
                      defaultValue={selectedPaciente?.notas ?? ""}
                      placeholder="Notas internas..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" disabled={submitting} onClick={cerrarModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : modalMode === "crear" ? "Crear paciente" : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/40" />
          <AlertDialog.Popup className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
              <AlertDialog.Title className="text-lg font-serif text-foreground">
                Desactivar paciente
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                ¿Estás seguro de desactivar a{" "}
                <span className="font-medium text-foreground">{pacienteToDelete?.nombre}</span>?
                <br />
                Los turnos históricos se conservarán.
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleEliminar}>
                  Desactivar
                </Button>
              </div>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
