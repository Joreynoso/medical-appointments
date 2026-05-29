import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans transition-colors duration-300">
      <main className="max-w-7xl w-full px-6 py-12 text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">

          <h1 className="text-7xl text-muted-foreground font-serif">
            Turnos médicos simples, rápidos y <span className="text-accent italic">sin complicaciones</span>.
          </h1>

        </div>

        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Ingresar al sistema
        </Link>

        <Link
          href="/theme"
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Guía de estilos
        </Link>
      </main>
    </div>
  );
}
