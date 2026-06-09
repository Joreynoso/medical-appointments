export default function DashboardLoading() {
  return (
    <div className="px-10 pb-10 animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-48 rounded-md bg-muted-foreground/10" />
        <div className="mt-1 h-4 w-64 rounded-md bg-muted-foreground/10" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="h-48 rounded-xl bg-muted-foreground/10" />
          <div className="h-64 rounded-xl bg-muted-foreground/10" />
        </div>
        <div className="space-y-6">
          <div className="h-36 rounded-xl bg-muted-foreground/10" />
          <div className="h-52 rounded-xl bg-muted-foreground/10" />
        </div>
      </div>
    </div>
  )
}
