import { Calendar } from "lucide-react"

export function SidebarHeader() {
  return (
    <div className="sidebar-header flex items-center gap-3 px-6 pt-7 pb-6 shrink-0">
      <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary">
        <Calendar className="size-5 text-sidebar-primary-foreground" />
      </div>
      <span className="font-heading text-base font-semibold text-sidebar-foreground">
        Medical Appointments
      </span>
    </div>
  )
}
