import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex-1 flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-foreground leading-[0.9]">
            Tu agenda médica, potenciada con{" "}
            <span className="text-accent italic">inteligencia artificial.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
            Gestiona turnos de forma simple, visual y eficiente. Sin
            complicaciones, sin dobles agendas, sin esfuerzo.
          </p>

          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="inline-flex px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Comenzar ahora
            </Link>
            <Link
              href="#"
              className="inline-flex px-6 py-3 rounded-full border border-border text-foreground font-medium text-lg hover:bg-muted transition-colors"
            >
              Más información
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full scale-[1.3]">
          <Image
            src="/images/landing_background.png"
            alt="Profesional de la salud usando la aplicación"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
