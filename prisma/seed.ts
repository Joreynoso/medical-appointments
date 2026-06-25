import "dotenv/config"
import { config } from "dotenv"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"

config({ path: resolve(__dirname, "../.env.local") })

const prisma = new PrismaClient()

const SEED_EMAIL = "doctor@prueba.com"
const SEED_PASSWORD = "DoctorPrueba2026!"

interface ClerkUser {
  id: string
  email_addresses: Array<{ email_address: string }>
  first_name: string
  last_name: string
}

async function obtenerOCrearUsuarioClerk(): Promise<string> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      "CLERK_SECRET_KEY no está definida en .env.local. " +
      "Creá una cuenta en https://clerk.com y agregá la clave a .env.local"
    )
  }

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  }

  const existingRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(SEED_EMAIL)}`,
    { headers },
  )

  if (existingRes.ok) {
    const existing: ClerkUser[] = await existingRes.json()
    if (existing.length > 0) {
      console.log(`✓ Usuario Clerk ya existe: ${existing[0].id}`)
      return existing[0].id
    }
  }

  const createRes = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email_address: [SEED_EMAIL],
      password: SEED_PASSWORD,
      first_name: "Juan",
      last_name: "Pérez",
    }),
  })

  if (!createRes.ok) {
    const errorBody = await createRes.text()
    throw new Error(
      `Error al crear usuario en Clerk (${createRes.status}): ${errorBody}`
    )
  }

  const created: ClerkUser = await createRes.json()
  console.log(`✓ Usuario Clerk creado: ${created.id}`)
  return created.id
}

async function main() {
  console.log("🌱 Iniciando seed...")

  const existing = await prisma.profesional.findFirst()
  if (existing) {
    console.log("⚠️  Ya existen datos en la base. Se omite el seed.")
    return
  }

  const clerkId = await obtenerOCrearUsuarioClerk()

  const profesional = await prisma.profesional.create({
    data: {
      clerkId,
      nombre: "Dr. Juan Pérez",
      email: SEED_EMAIL,
      configuracion: {
        create: {
          duracionSlot: 30,
          horarioDesde: "09:00",
          horarioHasta: "17:00",
        },
      },
    },
  })
  console.log(`✓ Profesional creado: ${profesional.nombre}`)

  const pacientesData = [
    { nombre: "María García", telefono: "11-2345-6789" },
    { nombre: "Carlos López", telefono: "11-3456-7890" },
    { nombre: "Ana Martínez", telefono: "11-4567-8901" },
    { nombre: "Pedro Sánchez", telefono: "11-5678-9012" },
    { nombre: "Laura Fernández", telefono: "11-6789-0123" },
    { nombre: "Roberto Díaz", telefono: "11-7890-1234", activo: false },
  ]

  const pacientes = await Promise.all(
    pacientesData.map((p) =>
      prisma.paciente.create({
        data: { ...p, profesionalId: profesional.id },
      })
    ),
  )
  console.log(`✓ ${pacientes.length} pacientes creados`)

  console.log("✓ Sin turnos de prueba — se crean desde la app")

  console.log("")
  console.log("✅ Seed completado exitosamente")
  console.log(`   Email: ${SEED_EMAIL}`)
  console.log(`   Password: ${SEED_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
