import Link from "next/link"

export function WelcomeCard() {
  return (
    <div className="rounded-lg bg-card flex flex-col border border-[#CBDEEC] shadow-[4px_0_30px_-6px_#E8EFF6]">
      <div className="flex flex-col justify-center p-8 lg:p-10 space-y-6">
        <h2 className="text-3xl lg:text-4xl font-sans text-foreground leading-tight">
          ¡Bienvenido a MedPilot!
        </h2>
        <p className="text-muted-foreground leading-relaxed text-base lg:text-lg max-w-md">
          Gestiona tus turnos, pacientes y agenda desde un solo lugar, de forma rápida y sin complicaciones.
        </p>
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all w-fit"
        >
          Ir a la agenda
        </Link>
      </div>
    </div>
  )
}
