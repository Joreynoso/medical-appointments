"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AgendaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm text-muted-foreground">Error al cargar la agenda</p>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </div>
  )
}
