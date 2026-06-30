"use client"

import { User } from "lucide-react"
import { useEffect, useRef } from "react"

interface Testimonial {
  name: string
  lastName: string
  profession: string
  opinion: string
}

const testimonials: Testimonial[] = [
  {
    name: "María",
    lastName: "Fernández",
    profession: "Cardióloga",
    opinion:
      "MedPilot transformó la gestión de mi consultorio. La IA me ayuda a optimizar los horarios y mis pacientes reciben recordatorios automáticos. Nunca más tuve que lidiar con ausencias inesperadas.",
  },
  {
    name: "Carlos",
    lastName: "Gutiérrez",
    profession: "Pediatra",
    opinion:
      "La plataforma es increíblemente intuitiva. Puedo gestionar turnos, ver estadísticas y comunicarme con mis pacientes desde cualquier dispositivo. Mis colegas y yo estamos encantados.",
  },
  {
    name: "Ana",
    lastName: "Martínez",
    profession: "Dermatóloga",
    opinion:
      "Lo que más valoro es el ahorro de tiempo. La agenda inteligente se adapta a mis necesidades y los reportes me permiten tomar decisiones informadas sobre mi práctica. Totalmente recomendado.",
  },
  {
    name: "Roberto",
    lastName: "López",
    profession: "Traumatólogo",
    opinion:
      "Implementar MedPilot en mi centro médico fue la mejor decisión. El soporte multi-profesional nos permite coordinar turnos entre varios especialistas sin conflictos ni dobles agendas.",
  },
  {
    name: "Laura",
    lastName: "Silva",
    profession: "Psicóloga",
    opinion:
      "Desde que uso MedPilot, la experiencia de mis pacientes mejoró notablemente. Los recordatorios automáticos redujeron las ausencias y puedo dedicar más tiempo a lo que realmente importa: la atención.",
  },
]

const initialRotations = [-3, 2.5, -2, 1.5, -1]
const buriedRotations = [-6, 5, -4.5, 3, -2]

export default function StackingCards() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        const cardElements = gsap.utils.toArray<HTMLElement>(".stack-card")

        cardElements.forEach((card, i) => {
          gsap.set(card, { rotation: initialRotations[i] })

          if (i === cardElements.length - 1) return

          gsap.to(card, {
            scale: 0.88 - i * 0.02,
            rotation: buriedRotations[i],
            ease: "none",
            scrollTrigger: {
              trigger: card.closest(".card-sticky"),
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
        })
      })
    })
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-dvh py-12 md:py-16" id="testimonios">
      <div className="mx-auto text-center mb-10 px-6">
        <h2 className="text-3xl sm:text-4xl font-sans text-foreground leading-snug">
          Lo que dicen nuestros
          <br />
          <span className="text-primary">profesionales</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Médicos y especialistas de todo el país ya confían en MedPilot para
          gestionar su agenda.
        </p>
      </div>

      {testimonials.map((t, i) => (
        <div key={i} className="card-sticky sticky top-0 h-screen flex items-center justify-center">
          <div
            id={`stack-card-${i}`}
            className="stack-card w-[624px] max-w-[90vw] border border-border rounded-2xl p-10 md:p-12 will-change-transform"
            style={{
              transformOrigin: "center center",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
          >
            <div className="flex items-center gap-5 mb-8">
              <div className="size-16 rounded-full shrink-0 bg-primary flex items-center justify-center">
                <User className="size-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {t.name} {t.lastName}
                </p>
                <p className="text-sm text-primary">{t.profession}</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              &ldquo;{t.opinion}&rdquo;
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
