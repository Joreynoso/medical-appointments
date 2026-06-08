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

    profesional = await prisma.profesional.create({
      data: {
        clerkId: userId,
        nombre,
        email,
      },
      include: { configuracion: true },
    })
  }

  return profesional
}
