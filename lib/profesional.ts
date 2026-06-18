import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getCurrentProfesional() {
  const { userId } = await auth.protect()

  let profesional = await prisma.profesional.findUnique({
    where: { clerkId: userId },
    include: { configuracion: true },
  })

  if (!profesional) {
    const clerkUser = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } },
    ).then((r) => r.json() as Promise<{ email_addresses: Array<{ email_address: string }>; first_name?: string; last_name?: string }>)

    const email = clerkUser.email_addresses?.[0]?.email_address ?? ""
    const nombre = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || email.split("@")[0]

    profesional = await prisma.profesional.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        nombre,
        email,
        configuracion: {
          create: {
            duracionSlot: 30,
            horarioDesde: "08:00",
            horarioHasta: "19:00",
            diasLaborables: [1, 2, 3, 4, 5, 6],
          },
        },
      },
      update: { nombre },
      include: { configuracion: true },
    })
  }

  return profesional
}
