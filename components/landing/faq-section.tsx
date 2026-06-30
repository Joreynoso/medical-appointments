"use client"

import { useState, useId } from "react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "¿Cómo funciona la gestión de turnos?",
    answer:
      "Podés administrar tu agenda desde un calendario visual o mediante un chat con IA que responde preguntas en lenguaje natural.",
  },
  {
    question: "¿Los pacientes pueden sacar turnos por su cuenta?",
    answer:
      "No. El sistema no tiene portal para pacientes. Los das de alta vos mismo al agendar un turno, sin necesidad de que ellos tengan cuenta.",
  },
  {
    question: "¿Puedo crear un paciente mientras agendo un turno?",
    answer:
      "Sí. Lo creás en el mismo formulario con un modal rápido. Se selecciona automáticamente y seguís con la carga del turno sin perder lo avanzado.",
  },
  {
    question: "¿Qué pasa si cancelo un turno?",
    answer:
      "El slot se libera y vuelve a estar disponible. Los turnos cancelados se ocultan del calendario; los ausentes quedan registrados visualmente.",
  },
  {
    question: "¿Los datos de mis pacientes están protegidos?",
    answer:
      "Sí. Toda la información se transmite cifrada y se almacena de forma segura. Los pacientes nunca se eliminan físicamente, solo se desactivan.",
  },
  {
    question: "¿Puedo configurar mis horarios de atención?",
    answer:
      "Sí. Definís tus días laborables, horarios y duración de turnos. El sistema genera los slots disponibles automáticamente sin superposiciones.",
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const baseId = useId()

  return (
    <section id="faq" className="min-h-dvh py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-left sm:text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-sans text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
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
                    "flex w-full items-center justify-between px-6 py-5 text-foreground font-medium text-left text-base sm:text-lg transition-colors duration-200",
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
