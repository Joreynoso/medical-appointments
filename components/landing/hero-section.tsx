import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex-1 flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-32 grid md:grid-cols-[1fr_1.1fr] gap-12 md:gap-16 items-center">
        <div className="hero-text space-y-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-foreground leading-[1.05]">
            Tu agenda médica, potenciada con{" "}
            <span className="text-primary italic">inteligencia artificial.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
            Gestiona turnos de forma simple, visual y eficiente. Sin
            complicaciones, sin dobles agendas, sin esfuerzo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity text-center"
            >
              Comenzar ahora
            </Link>
            <Link
              href="#"
              className="inline-flex px-6 py-3 rounded-full border border-border text-foreground font-medium text-lg hover:bg-muted transition-colors text-center"
            >
              Más información
            </Link>
          </div>
        </div>

        <div className="hero-image relative aspect-[4/3] w-full rounded-2xl overflow-hidden">
          <img
            src="/images/bg-dark.png"
            alt="MedPilot dashboard preview"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
