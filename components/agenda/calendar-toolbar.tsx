"use client"

import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonthYear } from "@/components/agenda/calendar-utils"

type CalendarToolbarProps = {
  currentDate: Date
  viewMode: "month" | "week"
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onFilterClick: () => void
  filterActive: boolean
  onViewChange: (mode: "month" | "week") => void
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onFilterClick,
  filterActive,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={onPrev} aria-label="Anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onNext} aria-label="Siguiente">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday} className="max-sm:text-xs max-sm:h-7 max-sm:px-2">
            Hoy
          </Button>
        </div>

        <span className="text-center text-xs sm:text-sm font-medium text-foreground sm:min-w-[130px]">
          {formatMonthYear(currentDate)}
        </span>

        <Button
          variant={filterActive ? "default" : "outline"}
          size="icon-sm"
          onClick={onFilterClick}
          aria-label="Filtrar"
          className="sm:hidden relative"
        >
          <Filter className="size-4" />
          {filterActive && (
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border border-background" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant={filterActive ? "default" : "outline"}
          size="sm"
          onClick={onFilterClick}
          className="hidden sm:inline-flex relative"
        >
          <Filter className="size-3.5" />
          Filtrar
          {filterActive && (
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border border-background" />
          )}
        </Button>

        <div className="flex overflow-hidden rounded-lg border border-border flex-1 sm:flex-none sm:ml-1">
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
    </div>
  )
}
