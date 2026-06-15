import { PageHeader } from "@/components/dashboard/page-header"
import { listarObrasSociales } from "@/lib/actions/obras-sociales"
import { ObrasSocialesClient } from "@/components/obras-sociales/obras-sociales-client"

export default async function ObrasSocialesPage() {
  const initialObrasSociales = await listarObrasSociales()

  return (
    <div className="px-4 md:px-10 pb-10">
      <PageHeader title="Obras Sociales" description="Administrá tu listado de obras sociales" />
      <ObrasSocialesClient initialObrasSociales={initialObrasSociales} />
    </div>
  )
}
