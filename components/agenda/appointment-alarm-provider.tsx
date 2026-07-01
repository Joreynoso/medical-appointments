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

      toast(
        turno.paciente.nombre,
        {
          icon: <Bell className="h-5 w-5 text-primary" />,
          description: `Próximo turno a las ${turno.horaInicio}${minutos > 0 ? ` (en ${minutos} min)` : " (ahora)"}`,
          duration: 15000,
        },
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
