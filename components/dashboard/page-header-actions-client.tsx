"use client"

import { usePageHeaderActions } from "@/components/dashboard/page-header-context"

export function PageHeaderActionsClient() {
  const { actions } = usePageHeaderActions()
  return <>{actions}</>
}
