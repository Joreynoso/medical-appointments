"use client"

import { useState, useId } from "react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "¿Cómo funciona la gestión de turnos?",
    answer:
      "Podés administrar tu agenda de dos formas: desde un calendario visual donde creás, consultás y cancelás turnos directamente, o mediante un chat con IA que responde preguntas en lenguaje natural, como '¿qué turnos tengo mañana?' o '¿hay disponibilidad esta semana?'.",
  },
  {
    question: "¿Los pacientes pueden sacar turnos por su cuenta?",
    answer:
      "No. El sistema no tiene portal para pacientes. El único usuario sos vos, el profesional. Los pacientes los das de alta vos mismo dentro de la app al momento de agendar un turno, sin necesidad de que ellos tengan cuenta.",
  },
  {
    question: "¿Puedo crear un paciente mientras agendo un turno?",
    answer:
      "Sí. Si el paciente aún no está registrado, lo creás en el mismo formulario con un modal rápido. Al guardarlo, se selecciona automáticamente y seguís con la carga del turno sin perder lo que ya completaste.",
  },
  {
    question: "¿Qué pasa si cancelo un turno?",
    answer:
      "El slot se libera automáticamente y vuelve a aparecer como disponible para otro paciente. Los turnos cancelados se ocultan del calendario, mientras que los pacientes ausentes quedan registrados visualmente para que tengas un control de inasistencias.",
  },
  {
    question: "¿Los datos de mis pacientes están protegidos?",
    answer:
      "Sí. Toda la información se transmite cifrada y se almacena de forma segura. Los pacientes nunca se eliminan físicamente — solo se desactivan — para preservar el historial clínico y la integridad de los datos.",
  },
  {
    question: "¿Puedo configurar mis horarios de atención?",
    answer:
      "Sí. Desde la sección de configuración definís tus días laborables, el horario de atención y la duración de cada turno. El sistema genera automáticamente los slots disponibles y evita superposiciones.",
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
                  "faq-item border border-border rounded-xl overflow-hidden transition-all hover:shadow-sm hover:bg-card hover:border-primary/30",
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
