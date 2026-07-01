"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
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
import type { ObraSocialListData } from "@/lib/actions/obras-sociales"

type ModalMode = "crear" | "editar" | null

type PacientesClientProps = {
  initialPacientes: PacienteListData[]
  obrasSociales: ObraSocialListData[]
}

const ITEMS_PER_PAGE = 7

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function PacientesClient({ initialPacientes, obrasSociales }: PacientesClientProps) {
  const [pacientes, setPacientes] = useState<PacienteListData[]>(initialPacientes)
  const [busqueda, setBusqueda] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteListData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pacienteToDelete, setPacienteToDelete] = useState<PacienteListData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPacientes = !busqueda
    ? pacientes
    : pacientes.filter((p) => normalize(p.nombre).includes(normalize(busqueda)))

  const totalPages = Math.max(1, Math.ceil(filteredPacientes.length / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPacientes = filteredPacientes.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  function cambiarPagina(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

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

      const notas = formData.get("notas") as string
      const obraSocialId = formData.get("obraSocialId") as string

      if (modalMode === "crear") {
        await crearPaciente({
          nombre: nombre.trim(),
          telefono: telefono?.trim() || undefined,
          notas: notas?.trim() || undefined,
          obraSocialId: obraSocialId || undefined,
        })
        toast.success("Paciente creado")
      } else if (modalMode === "editar" && selectedPaciente) {
        await actualizarPaciente(selectedPaciente.id, {
          nombre: nombre.trim(),
          telefono: telefono?.trim() || undefined,
          notas: notas?.trim() || undefined,
          obraSocialId: obraSocialId || null,
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
            onChange={(e) => {
              setBusqueda(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
          />
        </div>
        {filteredPacientes.length > ITEMS_PER_PAGE && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-lg"
              disabled={currentPage === 1}
              onClick={() => cambiarPagina(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              disabled={currentPage === totalPages}
              onClick={() => cambiarPagina(currentPage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            <span className="ml-1 min-w-[60px] md:min-w-[80px] text-center text-xs md:text-sm font-medium text-foreground">
              {currentPage}/{totalPages}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={abrirCrear}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 size-9 md:size-auto md:px-5 md:py-2 md:gap-2"
        >
          <Plus className="size-4" />
          <span className="hidden md:inline text-sm font-medium">Nuevo paciente</span>
        </button>
      </div>

      <div className="hidden md:block rounded-lg border border-border bg-card">
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Obra Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedPacientes.map((paciente) => (
                <tr key={paciente.id} className="group hover:bg-muted/50">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">
                    {paciente.nombre}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {paciente.telefono || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {paciente.obraSocial?.nombre || "—"}
                  </td>
                  <td className="max-w-xs truncate px-6 py-3 text-sm text-muted-foreground">
                    {paciente.notas || "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
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

      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredPacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {busqueda ? "No se encontraron pacientes" : "No hay pacientes registrados"}
            </p>
            {!busqueda && (
              <button
                type="button"
                onClick={abrirCrear}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                <Plus className="size-4" />
                Crear primer paciente
              </button>
            )}
          </div>
        ) : (
          paginatedPacientes.map((paciente) => (
            <div
              key={paciente.id}
              className="rounded-lg border border-border bg-card p-4 min-h-[84px]"
            >
              <div className="flex items-start justify-between gap-2 h-full">
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-foreground truncate">
                    {paciente.nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {paciente.telefono || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {paciente.obraSocial?.nombre || "—"}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground/70 line-clamp-2 min-h-[2.5em]">
                    {paciente.notas || "\u00A0"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 items-start">
                  <button
                    type="button"
                    onClick={() => abrirEditar(paciente)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmarEliminar(paciente)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-all"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <Dialog.Title className="text-lg font-sans text-foreground">
                  {modalMode === "crear" ? "Nuevo paciente" : "Editar paciente"}
                </Dialog.Title>
                <button type="button" onClick={cerrarModal} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
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
                    defaultValue={selectedPaciente?.nombre ?? ""}
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
                    defaultValue={selectedPaciente?.telefono ?? ""}
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
                    defaultValue={selectedPaciente?.obraSocialId ?? ""}
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
                    defaultValue={selectedPaciente?.notas ?? ""}
                    placeholder="Notas internas..."
                    className="w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" disabled={submitting} onClick={cerrarModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Guardando...
                      </>
                    ) : modalMode === "crear" ? (
                      "Crear paciente"
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <AlertDialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
              <AlertDialog.Title className="text-lg font-sans text-foreground">
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
