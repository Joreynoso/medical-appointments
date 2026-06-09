"use client"

import { useState, useId } from "react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "¿Cómo funciona el sistema de agendamiento?",
    answer:
      "Seleccionás al profesional, elegís un turno disponible y lo confirmás al instante. La IA optimiza los horarios para evitar superposiciones y maximizar la eficiencia de la agenda.",
  },
  {
    question: "¿Es necesario registrarse para usarlo?",
    answer:
      "Sí, necesitás crear una cuenta gratuita para acceder al dashboard. El registro es rápido y podés gestionar todos tus turnos desde un solo lugar.",
  },
  {
    question: "¿Puedo cancelar o reprogramar un turno?",
    answer:
      "Sí, desde tu perfil podés cancelar o reprogramar turnos con antelación. El sistema libera automáticamente el horario y te muestra nuevas opciones disponibles.",
  },
  {
    question: "¿Los datos médicos están protegidos?",
    answer:
      "Absolutamente. Cumplimos con normativas de protección de datos. Toda la información se transmite cifrada y se almacena de forma segura.",
  },
  {
    question: "¿Integra con mi calendario personal?",
    answer:
      "Sí, podés sincronizar tus turnos con Google Calendar, Outlook o iCal. Recibís recordatorios automáticos para no olvidar ninguna cita.",
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const baseId = useId()

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todo lo que necesitás saber antes de empezar.
          </p>
        </div>

        <div className="faq-list space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            const contentId = `${baseId}-faq-${i}`
            return (
              <div
                key={i}
                className={cn(
                  "faq-item border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm hover:bg-card",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className={cn(
                    "flex w-full items-center justify-between px-6 py-5 text-foreground font-medium text-lg transition-colors duration-200",
                    isOpen && "bg-muted/50",
                  )}
                >
                  {faq.question}
                  <span
                    className={cn(
                      "shrink-0 ml-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                      isOpen && "rotate-45",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                <div
                  id={contentId}
                  role="region"
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 pt-2 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
