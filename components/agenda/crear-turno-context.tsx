"use client"

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react"
import { CrearTurnoModal } from "@/components/agenda/crear-turno-modal"
import { getTurnosEnRango } from "@/lib/actions/turnos"
import type { TurnoData } from "@/lib/actions/turnos"

type PacienteSimple = {
  id: string
  nombre: string
}

type CrearTurnoContextType = {
  openCrearTurno: () => void
  setPacientes: (pacientes: PacienteSimple[]) => void
  setRefreshRange: (desde: string, hasta: string) => void
  setOnTurnosChange: (cb: (turnos: TurnoData[]) => void) => void
}

const CrearTurnoContext = createContext<CrearTurnoContextType>({
  openCrearTurno: () => {},
  setPacientes: () => {},
  setRefreshRange: () => {},
  setOnTurnosChange: () => {},
})

export function useCrearTurno() {
  return useContext(CrearTurnoContext)
}

export function CrearTurnoProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [pacientes, setPacientes] = useState<PacienteSimple[]>([])
  const refreshRangeRef = useRef({ desde: "", hasta: "" })
  const onTurnosChangeRef = useRef<((turnos: TurnoData[]) => void) | null>(null)

  const setRefreshRange = useCallback((desde: string, hasta: string) => {
    refreshRangeRef.current = { desde, hasta }
  }, [])

  const setOnTurnosChange = useCallback((cb: (turnos: TurnoData[]) => void) => {
    onTurnosChangeRef.current = cb
  }, [])

  const handleTurnoCreado = useCallback(async () => {
    const { desde, hasta } = refreshRangeRef.current
    const cb = onTurnosChangeRef.current
    if (desde && hasta && cb) {
      const data = await getTurnosEnRango(desde, hasta)
      cb(data)
    }
  }, [])

  return (
    <CrearTurnoContext.Provider
      value={{
        openCrearTurno: () => setModalOpen(true),
        setPacientes,
        setRefreshRange,
        setOnTurnosChange,
      }}
    >
      {children}
      <CrearTurnoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        pacientes={pacientes}
        onTurnoCreado={handleTurnoCreado}
      />
    </CrearTurnoContext.Provider>
  )
}
