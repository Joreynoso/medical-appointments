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

function addMinutes(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number)
  const total = h * 60 + m + minutos
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
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

  const particular = await prisma.obraSocial.create({
    data: {
      profesionalId: profesional.id,
      nombre: "Particular",
    },
  })
  console.log("✓ Obra social 'Particular' creada")

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
        data: { ...p, profesionalId: profesional.id, obraSocialId: particular.id },
      })
    ),
  )
  console.log(`✓ ${pacientes.length} pacientes creados`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const turnosData = [
    { pacienteIdx: 0, fecha: today, horaInicio: "09:00", estado: "PENDIENTE" as const },
    { pacienteIdx: 1, fecha: today, horaInicio: "10:00", estado: "CONFIRMADO" as const },
    { pacienteIdx: 2, fecha: today, horaInicio: "11:30", estado: "PENDIENTE" as const },
    { pacienteIdx: 0, fecha: tomorrow, horaInicio: "09:30", estado: "PENDIENTE" as const },
    { pacienteIdx: 3, fecha: tomorrow, horaInicio: "11:00", estado: "CONFIRMADO" as const },
    { pacienteIdx: 4, fecha: tomorrow, horaInicio: "14:00", estado: "PENDIENTE" as const },
    { pacienteIdx: 1, fecha: nextWeek, horaInicio: "10:00", estado: "CONFIRMADO" as const },
    { pacienteIdx: 2, fecha: nextWeek, horaInicio: "15:00", estado: "PENDIENTE" as const },
    { pacienteIdx: 3, fecha: yesterday, horaInicio: "09:00", estado: "CANCELADO" as const },
    { pacienteIdx: 4, fecha: twoDaysAgo, horaInicio: "10:00", estado: "AUSENTE" as const },
  ]

  const turnos = await Promise.all(
    turnosData.map((t) =>
      prisma.turno.create({
        data: {
          profesionalId: profesional.id,
          pacienteId: pacientes[t.pacienteIdx].id,
          fecha: t.fecha,
          horaInicio: t.horaInicio,
          horaFin: addMinutes(t.horaInicio, 30),
          estado: t.estado,
        },
      })
    ),
  )
  console.log(`✓ ${turnos.length} turnos creados`)

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
