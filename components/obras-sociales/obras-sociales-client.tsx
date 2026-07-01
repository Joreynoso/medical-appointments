"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Loader2, Users, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, AlertDialog } from "@base-ui/react"
import {
  listarObrasSociales,
  crearObraSocial,
  actualizarObraSocial,
  desactivarObraSocial,
} from "@/lib/actions/obras-sociales"
import { listarPacientes } from "@/lib/actions/pacientes"
import type { ObraSocialListData } from "@/lib/actions/obras-sociales"
import type { PacienteListData } from "@/lib/actions/pacientes"

type ModalMode = "crear" | "editar" | null

type ObrasSocialesClientProps = {
  initialObrasSociales: ObraSocialListData[]
}

const ITEMS_PER_PAGE = 7

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function ObrasSocialesClient({ initialObrasSociales }: ObrasSocialesClientProps) {
  const [obrasSociales, setObrasSociales] = useState<ObraSocialListData[]>(initialObrasSociales)
  const [busqueda, setBusqueda] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedObraSocial, setSelectedObraSocial] = useState<ObraSocialListData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [obraSocialToDelete, setObraSocialToDelete] = useState<ObraSocialListData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pacientesModalOpen, setPacientesModalOpen] = useState(false)
  const [obraSocialPacientes, setObraSocialPacientes] = useState<PacienteListData[]>([])
  const [obraSocialNombre, setObraSocialNombre] = useState("")
  const [loadingPacientes, setLoadingPacientes] = useState(false)

  const filtered = !busqueda
    ? obrasSociales
    : obrasSociales.filter((o) => normalize(o.nombre).includes(normalize(busqueda)))

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  function cambiarPagina(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const cargar = useCallback(async () => {
    try {
      const data = await listarObrasSociales()
      setObrasSociales(data)
    } catch {
      toast.error("Error al cargar obras sociales")
    }
  }, [])

  function abrirCrear() {
    setModalMode("crear")
    setSelectedObraSocial(null)
    setModalOpen(true)
  }

  function abrirEditar(item: ObraSocialListData) {
    setModalMode("editar")
    setSelectedObraSocial(item)
    setModalOpen(true)
  }

  function cerrarModal() {
    setModalOpen(false)
    setModalMode(null)
    setSelectedObraSocial(null)
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      const nombre = formData.get("nombre") as string

      if (!nombre?.trim()) {
        toast.error("El nombre es obligatorio")
        return
      }

      if (modalMode === "crear") {
        await crearObraSocial({ nombre: nombre.trim() })
        toast.success("Obra social creada")
      } else if (modalMode === "editar" && selectedObraSocial) {
        await actualizarObraSocial(selectedObraSocial.id, { nombre: nombre.trim() })
        toast.success("Obra social actualizada")
      }
      cerrarModal()
      cargar()
    } catch {
      toast.error("Error al guardar obra social")
    } finally {
      setSubmitting(false)
    }
  }

  function confirmarEliminar(item: ObraSocialListData) {
    setObraSocialToDelete(item)
    setDeleteDialogOpen(true)
  }

  async function verPacientes(item: ObraSocialListData) {
    setObraSocialNombre(item.nombre)
    setPacientesModalOpen(true)
    setLoadingPacientes(true)
    try {
      const todos = await listarPacientes()
      setObraSocialPacientes(todos.filter((p) => p.obraSocialId === item.id))
    } catch {
      toast.error("Error al cargar pacientes")
      setObraSocialPacientes([])
    } finally {
      setLoadingPacientes(false)
    }
  }

  async function handleEliminar() {
    if (!obraSocialToDelete) return
    try {
      await desactivarObraSocial(obraSocialToDelete.id)
      toast.success("Obra social desactivada")
      setDeleteDialogOpen(false)
      setObraSocialToDelete(null)
      cargar()
    } catch {
      toast.error("Error al desactivar obra social")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar obra social..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
          />
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
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
          <span className="hidden md:inline text-sm font-medium">Nueva obra social</span>
        </button>
      </div>

      <div className="hidden md:block rounded-lg border border-border bg-card shadow-[4px_0_30px_-6px_#E8EFF6] dark:shadow-none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {busqueda ? "No se encontraron obras sociales" : "No hay obras sociales registradas"}
            </p>
            {!busqueda && (
              <Button variant="outline" className="mt-4" onClick={abrirCrear}>
                <Plus className="size-4" />
                Crear primera obra social
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
                  Pacientes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/50">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-3">
                    {item._count.pacientes > 0 ? (
                      <button
                        type="button"
                        onClick={() => verPacientes(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium text-primary transition-all hover:bg-primary/10 active:scale-95"
                      >
                        <Users className="size-3.5" />
                        {item._count.pacientes}
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => abrirEditar(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => confirmarEliminar(item)}
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {busqueda ? "No se encontraron obras sociales" : "No hay obras sociales registradas"}
            </p>
            {!busqueda && (
              <button
                type="button"
                onClick={abrirCrear}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                <Plus className="size-4" />
                Crear primera obra social
              </button>
            )}
          </div>
        ) : (
          paginated.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 min-h-[84px] shadow-[4px_0_30px_-6px_#E8EFF6] dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-2 h-full">
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.nombre}
                  </p>
                  {item._count.pacientes > 0 ? (
                    <button
                      type="button"
                      onClick={() => verPacientes(item)}
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary transition-all hover:underline"
                    >
                      <Users className="size-3" />
                      {item._count.pacientes} paciente{(item._count.pacientes !== 1) ? "s" : ""}
                    </button>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      0 pacientes
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 items-start">
                  <button
                    type="button"
                    onClick={() => abrirEditar(item)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmarEliminar(item)}
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
                  {modalMode === "crear" ? "Nueva obra social" : "Editar obra social"}
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
                    defaultValue={selectedObraSocial?.nombre ?? ""}
                    placeholder="Ej: OSDE, Swiss Medical..."
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-50"
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
                      "Crear obra social"
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

      <Dialog.Root open={pacientesModalOpen} onOpenChange={setPacientesModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between shrink-0 mb-2">
                <Dialog.Title className="text-sm font-semibold text-foreground">
                  Pacientes de {obraSocialNombre}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setPacientesModalOpen(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="h-px bg-border/50 mb-3" />
              <div className="overflow-y-auto flex-1 -mx-1 px-1">
                {loadingPacientes ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando pacientes...
                  </div>
                ) : obraSocialPacientes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No hay pacientes con esta obra social
                  </p>
                ) : (
                  <div className="space-y-1">
                    {obraSocialPacientes.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <span className="size-2 shrink-0 rounded-full bg-primary/60" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.nombre}
                          </p>
                          {p.telefono && (
                            <p className="text-xs text-muted-foreground truncate">{p.telefono}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                Desactivar obra social
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                ¿Estás seguro de desactivar{" "}
                <span className="font-medium text-foreground">{obraSocialToDelete?.nombre}</span>?
                <br />
                {obraSocialToDelete && obraSocialToDelete._count.pacientes > 0 && (
                  <>
                    <span className="mt-2 block text-destructive">
                      {obraSocialToDelete._count.pacientes} paciente{(obraSocialToDelete._count.pacientes !== 1) ? "s" : ""} perder{(obraSocialToDelete._count.pacientes === 1) ? "á" : "án"} esta referencia.
                    </span>
                  </>
                )}
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
