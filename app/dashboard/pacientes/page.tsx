import { PageHeader } from "@/components/dashboard/page-header"
import { listarPacientes } from "@/lib/actions/pacientes"
import { PacientesClient } from "@/components/pacientes/pacientes-client"

export default async function PacientesPage() {
  const initialPacientes = await listarPacientes()

  return (
    <div className="px-4 md:px-10 pb-10">
      <PageHeader title="Pacientes" description="Administra tu lista de pacientes" />
      <PacientesClient initialPacientes={initialPacientes} />
    </div>
  )
}
