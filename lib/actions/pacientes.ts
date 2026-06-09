"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getCurrentProfesional } from "@/lib/profesional"
import { revalidatePath } from "next/cache"

export type PacienteListData = {
  id: string
  nombre: string
  telefono: string | null
  notas: string | null
  createdAt: Date
  updatedAt: Date
}

export const listarPacientes = cache(async (): Promise<PacienteListData[]> => {
  const profesional = await getCurrentProfesional()

  return prisma.paciente.findMany({
    where: {
      profesionalId: profesional.id,
      activo: true,
    },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      notas: true,
      createdAt: true,
      updatedAt: true,
    },
  })
})

export async function crearPaciente(data: { nombre: string; telefono?: string }) {
  const profesional = await getCurrentProfesional()

  const paciente = await prisma.paciente.create({
    data: {
      profesionalId: profesional.id,
      nombre: data.nombre,
      telefono: data.telefono ?? null,
    },
  })

  revalidatePath("/dashboard/pacientes")
  return paciente
}

export async function actualizarPaciente(id: string, data: { nombre: string; telefono?: string; notas?: string }) {
  const profesional = await getCurrentProfesional()

  const paciente = await prisma.paciente.update({
    where: { id, profesionalId: profesional.id },
    data: {
      nombre: data.nombre,
      telefono: data.telefono ?? null,
      notas: data.notas ?? null,
    },
  })

  revalidatePath("/dashboard/pacientes")
  return paciente
}

export async function desactivarPaciente(id: string) {
  const profesional = await getCurrentProfesional()

  await prisma.paciente.update({
    where: { id, profesionalId: profesional.id },
    data: { activo: false },
  })

  revalidatePath("/dashboard/pacientes")
}
