"use client"

import { useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Bell } from "lucide-react"
import { getTurnosAEmpezar } from "@/lib/actions/turnos"
export function AppointmentAlarmProvider() {
  const notifiedRef = useRef<Set<string>>(new Set())
  const dayRef = useRef<string>("")

  const check = useCallback(async () => {
    const result = await getTurnosAEmpezar()
    if (!result.dentroHorario || result.turnos.length === 0) return

    const today = new Date().toISOString().slice(0, 10)
    if (dayRef.current !== today) {
      notifiedRef.current.clear()
      dayRef.current = today
    }

    for (const turno of result.turnos) {
      if (notifiedRef.current.has(turno.id)) continue
      notifiedRef.current.add(turno.id)

      playNotificationSound()

      const minutos = calcularMinutosPara(turno.horaInicio)

      toast.custom(
        () => (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm font-medium text-card-foreground">
                {turno.paciente.nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                Próximo turno a las {turno.horaInicio}
                {minutos > 0 ? ` (en ${minutos} min)` : " (ahora)"}
              </p>
            </div>
          </div>
        ),
        { duration: 15000 },
      )
    }
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [check])

  return null
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

function calcularMinutosPara(horaInicio: string): number {
  const ahora = new Date()
  const [h, m] = horaInicio.split(":").map(Number)
  return h * 60 + m - (ahora.getHours() * 60 + ahora.getMinutes())
}
