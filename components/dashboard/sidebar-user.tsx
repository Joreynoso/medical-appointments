"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function SidebarUser() {
  const { user } = useUser()
  const { signOut } = useClerk()

  if (!user) return null

  const initials = (
    user.firstName?.charAt(0) ||
    user.emailAddresses[0]?.emailAddress?.charAt(0) ||
    "?"
  ).toUpperCase()

  return (
    <div className="sidebar-user shrink-0 px-4 pb-6 pt-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-sm font-medium text-sidebar-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
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
