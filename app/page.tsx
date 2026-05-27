import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Decorative background glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-[140px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 bg-clip-text text-transparent">
              medical
            </span>
            <span className="text-xl font-light text-emerald-500">.appointments</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MVP Activo
          </span>
          <a
            href="https://github.com/Joreynoso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.001-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto w-full">
        
        {/* Badge Hero */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400">
          <svg
            className="w-4 h-4 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Siguiente nivel en gestión de consultas
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6">
            Gestiona tus turnos a la{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
              velocidad del pensamiento
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            La plataforma médica definitiva para profesionales independientes. Control total de tu agenda con un calendario intuitivo y un asistente de Inteligencia Artificial integrado.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 dark:shadow-emerald-950/20 hover:shadow-emerald-500/35 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span>Acceder al Sistema</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <a
              href="#caracteristicas"
              className="px-8 py-4 w-full sm:w-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-center"
            >
              Ver características
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="caracteristicas" className="w-full pt-12 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Diseñado para simplificar tu día a día
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Todo lo que necesitas en una sola pantalla, sin navegaciones complejas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Calendario */}
            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">
                Calendario Interactivo
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                Gestión de turnos visual con vistas mensuales y semanales. Muestra de slots disponibles adaptados a tu horario y feriados argentinos integrados automáticamente en base de datos.
              </p>
            </div>

            {/* Card 2: Chatbot */}
            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/5 text-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">
                Asistente de IA (Groq)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                Consulta y opera tu agenda mediante lenguaje natural o botones rápidos de acceso directo. Interfaz conversacional fluida que responde en tiempo real con datos de tu base.
              </p>
            </div>

            {/* Card 3: CRM Pacientes */}
            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">
                Gestión de Pacientes
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                Registro y edición simplificada de la base de pacientes desde el modal de turnos. Incluye soft-delete lógico para conservar todo tu historial de consultas sin romper relaciones.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div>
          <span>© 2026 Jose Oscar Reynoso. Desarrollado como proyecto final.</span>
        </div>
        <div className="flex gap-4">
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
            Next.js 16 + Tailwind CSS v4 + Neon + Prisma
          </span>
        </div>
      </footer>
    </div>
  );
}
