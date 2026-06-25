import { listarPacientes } from "@/lib/actions/pacientes"
import { listarObrasSociales } from "@/lib/actions/obras-sociales"
import { PacientesRecientesCard } from "@/components/dashboard/pacientes-recientes-card"

export async function PacientesWrapper() {
  const [pacientes, obrasSociales] = await Promise.all([
    listarPacientes(),
    listarObrasSociales(),
  ])
  return (
    <PacientesRecientesCard
      initialPacientes={pacientes}
      obrasSociales={obrasSociales}
    />
  )
}
