import { SidebarHeader } from "./sidebar-header"
import { SidebarNav } from "./sidebar-nav"
import { SidebarUser } from "./sidebar-user"

export function Sidebar() {
  return (
    <aside className="sidebar fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <SidebarHeader />
      <SidebarNav />
      <SidebarUser />
    </aside>
  )
}
