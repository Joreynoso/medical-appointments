"use client"

import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { Dialog } from "@base-ui/react"
import { Button } from "@/components/ui/button"

type CerrarSesionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CerrarSesionModal({ open, onOpenChange }: CerrarSesionModalProps) {
  const { signOut } = useClerk()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="size-6 text-destructive" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-serif text-foreground">
                  Cerrar sesión
                </Dialog.Title>
                <p className="mt-1 text-sm text-muted-foreground">
                  ¿Estás seguro de que querés cerrar sesión?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={signingOut}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  "Cerrar sesión"
                )}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
