"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type PageHeaderActionsContext = {
  actions: ReactNode
  setActions: (actions: ReactNode) => void
}

const PageHeaderActionsContext = createContext<PageHeaderActionsContext>({
  actions: null,
  setActions: () => {},
})

export function PageHeaderActionsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [actions, setActions] = useState<ReactNode>(null)
  return (
    <PageHeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </PageHeaderActionsContext.Provider>
  )
}

export function usePageHeaderActions() {
  return useContext(PageHeaderActionsContext)
}
