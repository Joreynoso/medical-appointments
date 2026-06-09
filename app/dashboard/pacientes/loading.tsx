export default function PacientesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Nombre", "Teléfono", "Notas", "Acciones"].map((col) => (
                <th key={col} className="px-4 py-3 text-left">
                  <div
                    className={`h-3 animate-pulse rounded bg-muted ${
                      col === "Acciones" ? "ml-auto w-14" : "w-16"
                    }`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="ml-auto flex items-center gap-1">
                    <div className="size-8 animate-pulse rounded-lg bg-muted" />
                    <div className="size-8 animate-pulse rounded-lg bg-muted" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
