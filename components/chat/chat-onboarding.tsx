"use client"

import { useState, useEffect } from "react"
import { Wrench } from "lucide-react"

type ChatOnboardingProps = {
  onDismiss: () => void
  toolButton: React.ReactNode
}

export function ChatOnboarding({ onDismiss, toolButton }: ChatOnboardingProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex-1" />

      <div
        className={`flex justify-end px-6 pb-6 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="relative max-w-xs rounded-xl border border-white/20 bg-primary p-4 text-center shadow-lg -mr-[3px]">
          <p className="text-sm text-primary-foreground leading-relaxed">
            Usá el botón{" "}
            <span className="inline-flex items-center gap-1 font-medium">
              <Wrench className="size-3.5" />
              Herramientas
            </span>{" "}
            para acceder rápido a tus turnos, disponibilidad y más.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => { localStorage.setItem("chat_onboarding", "true"); onDismiss() }}
              className="rounded-lg border border-white/30 px-4 py-1.5 text-xs font-medium text-primary-foreground/80 transition-colors hover:bg-white/10"
            >
              No volver a mostrar
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg bg-primary-foreground px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:opacity-90"
            >
              Entendido
            </button>
          </div>
          <div className="absolute -bottom-[5px] size-2.5 rotate-45 border-b border-r border-white/20 bg-primary right-[63px]" />
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 pb-4">
        {toolButton}
        <div className="size-9 shrink-0" />
      </div>
    </div>
  )
}
