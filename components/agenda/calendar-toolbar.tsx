"use client"

import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
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

function viewBtnCls(active: boolean) {
  return [
    "inline-flex h-7 items-center rounded-lg border px-3 text-xs font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border text-muted-foreground hover:text-foreground",
  ].join(" ")
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
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Anterior"
          className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Siguiente"
          className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Filtrar"
          className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors sm:hidden relative"
        >
          <Filter className="size-4" />
          {filterActive && (
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border border-background" />
          )}
        </button>
      </div>

      <span className="text-center text-xs sm:text-sm font-medium text-foreground sm:min-w-[130px] max-sm:hidden">
        {formatMonthYear(currentDate)}
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] font-medium text-foreground hover:bg-muted transition-colors max-sm:hidden relative"
        >
          <Filter className="size-3.5" />
          Filtrar
          {filterActive && (
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border border-background" />
          )}
        </button>

        <span className="max-sm:hidden text-muted-foreground/40">|</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className={viewBtnCls(viewMode === "month")}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={onToday}
            className="inline-flex h-7 items-center rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className={viewBtnCls(viewMode === "week")}
          >
            Sem
          </button>
        </div>
      </div>
    </div>
  )
}
