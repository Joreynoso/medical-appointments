"use client"

import dynamic from "next/dynamic"

const LandingAnimations = dynamic(
  () => import("@/components/landing/landing-animations").then((m) => m.LandingAnimations),
  { ssr: false },
)

export default function LandingAnimationsWrapper() {
  return <LandingAnimations />
}
