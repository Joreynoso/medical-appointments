"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/chat", label: "Chat IA", icon: MessageSquare },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
]

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

export function SidebarNav() {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  return (
    <nav className="sidebar-navigation flex-1 overflow-y-auto px-3 pt-4 pb-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActivePath(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "nav-item flex items-center rounded-full text-sm font-medium transition-all",
              collapsed
                ? "justify-center mx-auto size-10"
                : "mx-2 gap-3 px-4 py-2.5",
              active
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/5 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span
              className={cn(
                "overflow-hidden transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
