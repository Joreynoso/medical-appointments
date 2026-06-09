"use client"

import { useEffect, useRef } from "react"

export function LandingAnimations() {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        gsap.fromTo(
          ".hero-animate",
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.2 },
        )

        gsap.fromTo(
          ".card-item",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: ".cards-grid", start: "top 85%", toggleActions: "play none none none" },
          },
        )

        gsap.fromTo(
          ".chat-message",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: { trigger: ".chat-demo", start: "top 85%", toggleActions: "play none none none" },
          },
        )

        gsap.fromTo(
          ".faq-item",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: ".faq-list", start: "top 85%", toggleActions: "play none none none" },
          },
        )
      })
    })
  }, [])

  return null
}
