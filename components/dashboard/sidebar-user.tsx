"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

export function SidebarUser() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { collapsed, expanded } = useSidebar()

  if (!user) {
    return (
      <div
        className={cn(
          "sidebar-user shrink-0 transition-[padding] duration-300 animate-pulse",
          expanded ? "px-6 pb-6 pt-6" : "flex justify-center px-0 pb-4 pt-4",
        )}
      >
        <div
          className={cn(
            "mb-4 rounded-xl overflow-hidden",
            expanded ? "block aspect-square w-full" : "hidden",
          )}
        >
          <img
            src="/images/bg-dark.png"
            alt="MedPilot preview"
            className="object-cover w-full h-full"
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
        "sidebar-user shrink-0 transition-[padding] duration-300",
        expanded ? "px-6 pb-6 pt-6" : "flex justify-center px-0 pb-4 pt-4",
      )}
    >
      <div
        className={cn(
          "mb-4 rounded-xl overflow-hidden",
          expanded ? "block aspect-square w-full" : "hidden",
        )}
      >
        <img
          src="/images/bg-dark.png"
          alt="MedPilot preview"
          className="object-cover w-full h-full"
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
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user.fullName || user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/50">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
          aria-label="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}
