"use client"

import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    const start = window.scrollY
    const duration = 500
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2
      window.scrollTo(0, start * (1 - ease))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-visible={visible}
      className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity data-[visible=false]:opacity-0 data-[visible=false]:pointer-events-none"
      aria-label="Volver al inicio"
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
