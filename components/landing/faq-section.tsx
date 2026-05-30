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
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todo lo que necesitás saber antes de empezar.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm hover:bg-card"
            >
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-foreground font-medium text-lg list-none">
                {faq.question}
                <span className="shrink-0 ml-4 text-muted-foreground transition-transform duration-200 group-open:rotate-45">
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
              </summary>
              <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
