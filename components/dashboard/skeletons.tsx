import { ImageIcon, BarChart3 } from "lucide-react"

export function WelcomeSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card flex flex-col lg:flex-row animate-pulse">
      <div className="lg:w-3/5 flex flex-col justify-center p-6 space-y-4">
        <div className="h-9 bg-muted rounded w-3/4" />
        <div className="h-5 bg-muted rounded w-full" />
        <div className="h-10 bg-muted rounded-full w-32" />
      </div>
      <div className="hidden lg:flex self-stretch w-2/5">
        <div className="w-full h-full border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/10">
          <ImageIcon className="size-12 text-muted-foreground/20" />
        </div>
      </div>
    </div>
  )
}

export function ProximosTurnosSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-8 bg-muted rounded w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
            <div className="size-2 rounded-full bg-muted shrink-0" />
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-3 bg-muted rounded w-14 shrink-0" />
            <div className="h-3 bg-muted rounded w-10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PacientesSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <div className="h-5 bg-muted rounded w-36" />
        <div className="h-8 bg-muted rounded w-28" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
            <div className="size-2 rounded-full bg-muted shrink-0" />
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-3 bg-muted rounded w-24 shrink-0" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center shrink-0">
        <div className="h-3 bg-muted rounded w-36" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5 animate-pulse">
      <div className="h-5 bg-muted rounded w-28" />
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <BarChart3 className="size-12 text-muted-foreground/20" />
      </div>
    </div>
  )
}
