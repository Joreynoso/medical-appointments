import Link from "next/link"
import Image from "next/image"

export function WelcomeCard() {
  return (
    <div className="rounded-lg border border-border bg-card flex flex-col lg:flex-row">
      <div className="lg:w-3/5 flex flex-col justify-center p-8 lg:p-10 space-y-6">
        <h2 className="text-3xl lg:text-4xl font-serif text-foreground leading-tight">
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
      <div className="hidden lg:flex self-stretch w-2/5 relative overflow-hidden rounded-r-lg">
        <Image
          src="/images/bg-dashboard.png"
          alt="Dashboard illustration"
          fill
          className="object-contain object-bottom"
        />
      </div>
    </div>
  )
}
