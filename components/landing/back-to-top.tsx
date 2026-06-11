"use client"

import { ArrowUp } from "lucide-react"

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      aria-label="Volver al inicio"
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
