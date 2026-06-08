"use client"

import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNav } from "./sidebar-nav"
import { SidebarUser } from "./sidebar-user"

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "sidebar fixed left-0 top-0 z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarHeader />
      <div className="flex justify-center py-1">
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex size-6 items-center justify-center rounded-full border border-border bg-sidebar text-sidebar-foreground/60 transition-all hover:text-sidebar-foreground",
            collapsed ? "" : "ml-auto -mr-3",
          )}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>
      <SidebarNav />
      <SidebarUser />
    </aside>
  )
}
