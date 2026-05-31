import Link from "next/link";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const messages: Message[] = [
  {
    role: "user",
    text: "¿Qué turnos tengo para mañana?",
  },
  {
    role: "assistant",
    text: "Mañana tenés 4 turnos:\n\n- Pérez — 09:00\n- López — 10:30\n- Martínez — 15:00\n- García — 16:30",
  },
  {
    role: "user",
    text: "Mostrame los datos de Martínez",
  },
  {
    role: "assistant",
    text: "---\nMartínez, Sofía\nEdad: 34 años\nMotivo: Control de rutina\nTeléfono: +54 11 5555-1234\nÚltima visita: 12/03/2026\n---",
  },
];

export default function CtaSection() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl sm:text-5xl font-serif text-foreground leading-[1.1]">
            Probá cómo funciona con
            <br />
            <span className="text-accent italic">lenguaje natural</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Consultá tu agenda al instante sin buscar manualmente. Con nuestro
            <span className="text-accent italic"> chat en tiempo real</span>, los
            profesionales pueden preguntar qué turnos tienen, ver datos de
            pacientes y gestionar su día con una simple frase.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity text-center"
            >
              Probar ahora
            </Link>
            <Link
              href="#"
              className="inline-flex items-center px-6 py-3 rounded-full border border-border text-foreground font-medium text-lg hover:bg-muted transition-colors text-center"
            >
              Ver documentación
            </Link>
          </div>
        </div>

        <div className="border border-border rounded-2xl bg-card p-4 sm:p-6 shadow-lg max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Asistente de agenda
              </p>
              <p className="text-xs text-muted-foreground">
                Consultas en tiempo real
              </p>
            </div>
          </div>

          <div className="space-y-4 min-h-[280px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                placeholder="Escribí tu consulta..."
                className="flex-1 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground border border-border outline-none"
              />
              <button
                type="button"
                className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
