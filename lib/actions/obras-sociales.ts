"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"
import { revalidatePath } from "next/cache"

export type ObraSocialListData = {
  id: string
  nombre: string
  activo: boolean
  _count: { pacientes: number }
  createdAt: Date
  updatedAt: Date
}

export const listarObrasSociales = cache(async (): Promise<ObraSocialListData[]> => {
  const profesional = await getCurrentProfesional()

  const existing = await prisma.obraSocial.findFirst({
    where: { profesionalId: profesional.id, activo: true },
    select: { id: true },
  })

  if (!existing) {
    await prisma.obraSocial.create({
      data: { profesionalId: profesional.id, nombre: "Particular" },
    })
  }

  return prisma.obraSocial.findMany({
    where: {
      profesionalId: profesional.id,
      activo: true,
    },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      activo: true,
      _count: { select: { pacientes: true } },
      createdAt: true,
      updatedAt: true,
    },
  })
})

export async function crearObraSocial(data: { nombre: string }) {
  const profesional = await getCurrentProfesional()

  await prisma.obraSocial.create({
    data: {
      profesionalId: profesional.id,
      nombre: data.nombre,
    },
  })

  revalidatePath("/dashboard/obras-sociales")
}

export async function actualizarObraSocial(id: string, data: { nombre: string }) {
  const profesional = await getCurrentProfesional()

  await prisma.obraSocial.update({
    where: { id, profesionalId: profesional.id },
    data: { nombre: data.nombre },
  })

  revalidatePath("/dashboard/obras-sociales")
}

export async function desactivarObraSocial(id: string) {
  const profesional = await getCurrentProfesional()

  await prisma.obraSocial.update({
    where: { id, profesionalId: profesional.id },
    data: { activo: false },
  })

  revalidatePath("/dashboard/obras-sociales")
}
