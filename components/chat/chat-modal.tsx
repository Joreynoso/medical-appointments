"use client"

import { Dialog } from "@base-ui/react"
import { X } from "lucide-react"
import { ChatShell } from "./chat-shell"

type ChatModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatModal({ open, onOpenChange }: ChatModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="relative flex h-full max-h-[100dvh] sm:h-[85vh] sm:max-h-[700px] w-full max-w-2xl flex-col rounded-none sm:rounded-xl border-0 sm:border border-border bg-card shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <Dialog.Title className="text-lg font-sans text-foreground">
                Chat IA
              </Dialog.Title>
              <button
                onClick={() => onOpenChange(false)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ChatShell />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
