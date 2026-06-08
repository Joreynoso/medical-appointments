"use client"

import Link from "next/link"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

export function SidebarHeader() {
  const { collapsed } = useSidebar()

  return (
    <Link
      href="/"
      className={cn(
        "sidebar-header flex items-center shrink-0 transition-[padding] duration-300",
        collapsed ? "justify-center px-0 pt-7 pb-6" : "gap-3 px-6 pt-7 pb-6",
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary shrink-0">
        <Calendar className="size-5 text-sidebar-primary-foreground" />
      </div>
      <span
        className={cn(
          "font-heading text-base text-sidebar-foreground overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
        )}
      >
        Medical Appointments
      </span>
    </Link>
  )
}
