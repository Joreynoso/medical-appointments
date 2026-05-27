import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-300">
      <main className="max-w-md w-full px-6 py-12 text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">medical</span>
          <span className="text-2xl font-light text-emerald-500">.appointments</span>
        </div>
        
        <h1 className="text-lg text-slate-500 dark:text-slate-400 font-light">
          Sistema de turnos médicos inteligente.
        </h1>
        
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          Ingresar al sistema
        </Link>
      </main>
    </div>
  );
}
