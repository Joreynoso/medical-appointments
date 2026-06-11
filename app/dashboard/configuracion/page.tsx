import { getConfiguracion } from "@/lib/actions/configuracion"
import { PageHeader } from "@/components/dashboard/page-header"
import { ConfiguracionForm } from "@/components/configuracion/configuracion-form"

export default async function ConfiguracionPage() {
  const config = await getConfiguracion()

  return (
    <div className="px-4 md:px-10 pb-10">
      <div className="max-w-lg">
        <PageHeader title="Configuración" description="Personaliza tu consultorio" />
        <ConfiguracionForm initialConfig={config} />
      </div>
    </div>
  )
}
