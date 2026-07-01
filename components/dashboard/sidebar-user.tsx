"use client"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { CerrarSesionModal } from "./cerrar-sesion-modal"

export function SidebarUser() {
  const { user } = useUser()
  const { collapsed, expanded } = useSidebar()
  const [modalOpen, setModalOpen] = useState(false)

  if (!user) {
    return (
      <div
        className={cn(
          "sidebar-user shrink-0",
          expanded ? "px-6 pb-6 pt-6" : "flex justify-center px-0 pb-4 pt-4",
        )}
      >
        <div
          className={cn(
            "mb-4 rounded-xl overflow-hidden max-lg:hidden",
            expanded ? "block aspect-square w-full" : "hidden",
          )}
        >
          <img
            src="/images/bg-ligth.png"
            alt="MedPilot preview"
            className="object-cover w-full h-full dark:hidden"
          />
          <img
            src="/images/bg-dark.png"
            alt="MedPilot preview"
            className="object-cover w-full h-full hidden dark:block"
          />
        </div>
      </div>
    )
  }

  const initials = (
    user.firstName?.charAt(0) ||
    user.emailAddresses[0]?.emailAddress?.charAt(0) ||
    "?"
  ).toUpperCase()

  return (
    <div
      className={cn(
        "sidebar-user shrink-0",
        expanded ? "px-6 pb-6 pt-6" : "flex justify-center px-0 pb-4 pt-4",
      )}
    >
      <div
        className={cn(
          "mb-4 rounded-xl overflow-hidden max-lg:hidden",
          expanded ? "block aspect-square w-full" : "hidden",
        )}
      >
        <img
          src="/images/bg-ligth.png"
          alt="MedPilot preview"
          className="object-cover w-full h-full dark:hidden"
        />
        <img
          src="/images/bg-dark.png"
          alt="MedPilot preview"
          className="object-cover w-full h-full hidden dark:block"
        />
      </div>
      <div
        className={cn(
          "flex items-center gap-3",
          expanded ? "" : "flex-col",
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {initials}
        </div>
        <div
          className={cn(
            "min-w-0 flex-1 overflow-hidden transition-all duration-300",
            expanded ? "block" : "hidden",
          )}
        >
          <p className="truncate text-sm font-medium text-foreground">
            {user.fullName || user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="truncate text-xs text-foreground/50">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-accent/10 hover:text-foreground"
          aria-label="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </button>
        <CerrarSesionModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </div>
  )
}
