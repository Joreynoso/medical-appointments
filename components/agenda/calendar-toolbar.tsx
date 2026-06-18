"use client"

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonthYear } from "@/components/agenda/calendar-utils"

type CalendarToolbarProps = {
  currentDate: Date
  viewMode: "month" | "week"
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (mode: "month" | "week") => void
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={onPrev} aria-label="Anterior">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={onNext} aria-label="Siguiente">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <span className="min-w-[90px] md:min-w-[130px] text-center text-xs md:text-sm font-medium text-foreground">
        {formatMonthYear(currentDate)}
      </span>

      <Button variant="outline" size="icon-sm" onClick={onToday} aria-label="Hoy" className="md:hidden">
        <CalendarDays className="size-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToday} className="hidden md:inline-flex">
        <CalendarDays className="size-3.5" />
        Hoy
      </Button>

      <div className="flex overflow-hidden rounded-lg border border-border max-sm:flex-1 sm:ml-1">
        <button
          type="button"
          onClick={() => onViewChange("month")}
          className={[
            "px-3 py-1.5 text-xs font-medium transition-all flex-1 sm:flex-none",
            viewMode === "month"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Mes
        </button>
        <button
          type="button"
          onClick={() => onViewChange("week")}
          className={[
            "px-3 py-1.5 text-xs font-medium transition-all flex-1 sm:flex-none",
            viewMode === "week"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Sem
        </button>
      </div>
    </div>
  )
}
