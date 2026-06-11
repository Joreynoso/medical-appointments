"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

const XL_BREAKPOINT = 1280

type SidebarContext = {
  collapsed: boolean
  expanded: boolean
  toggleCollapsed: () => void
  mobileOpen: boolean
  toggleMobileOpen: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContext | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userToggled = useRef(false)

  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < XL_BREAKPOINT) {
        setCollapsed(true)
      } else if (!userToggled.current) {
        setCollapsed(false)
      }
    }

    checkSize()
    const handleResize = () => {
      if (window.innerWidth < XL_BREAKPOINT) {
        setCollapsed(true)
        userToggled.current = false
      }
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleCollapsed = () => {
    userToggled.current = window.innerWidth >= XL_BREAKPOINT
    setCollapsed((prev) => !prev)
  }

  const toggleMobileOpen = () => setMobileOpen((prev) => !prev)
  const closeMobile = () => setMobileOpen(false)

  return (
    <SidebarContext.Provider value={{ collapsed, expanded: !collapsed || mobileOpen, toggleCollapsed, mobileOpen, toggleMobileOpen, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
