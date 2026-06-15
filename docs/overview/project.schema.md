# project.schema — medical-appointments
> Documentación de modelos de base de datos, relaciones y decisiones de diseño.
> El código real vive en `prisma/schema.prisma`. Este documento explica el **por qué** de cada decisión.

---

## Diagrama de relaciones

```
Profesional
    │
    ├──── ConfiguracionProfesional (1:1)
    │
    ├──── ObraSocial (1:N)
    │         │
    │         └──── Paciente (1:N)
    │
    ├──── Paciente (1:N)
    │         │
    │         └──── Turno (1:N)
    │
    ├──── Turno (1:N)
    │
    └──── Feriado (sin relación directa — global para todos)
```

---

## Modelos

### `Profesional`
Representa al profesional de la salud autenticado. Es el usuario principal del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `clerkId` | `String` (unique) | ID del usuario en Clerk — fuente de verdad de autenticación |
| `nombre` | `String` | Nombre completo del profesional |
| `email` | `String` (unique) | Email del profesional |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Última actualización |

**Relaciones:**
- Tiene una `ConfiguracionProfesional` (1:1)
- Tiene muchos `Paciente` (1:N)
- Tiene muchos `Turno` (1:N)

**Decisiones:**
- `clerkId` es el puente entre Clerk y la base de datos. En cada request se busca el `Profesional` por `clerkId` para obtener el ID interno.

---

### `ConfiguracionProfesional`
Configuración de agenda del profesional. Define cómo se generan los slots disponibles.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `profesionalId` | `String` (unique) | Referencia al profesional (1:1) |
| `duracionSlot` | `Int` | Duración de cada turno en minutos (ej. 20, 30, 45) |
| `horarioDesde` | `String` | Hora de inicio de atención (ej. "08:00") |
| `horarioHasta` | `String` | Hora de fin de atención (ej. "18:00") |
| `diasLaborables` | `Int[]` | Array de días de la semana laborables (0=domingo…6=sábado). Default `[1,2,3,4,5,6]` |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Última actualización |

**Decisiones:**
- `horarioDesde` y `horarioHasta` se guardan como `String` en formato `"HH:mm"` para simplicidad. No se usan tipos `Time` de PostgreSQL para evitar complejidad de zonas horarias.
- `diasLaborables` se guarda como `Int[]` nativo de PostgreSQL. El domingo (0) está hard-bloqueado: no aparece en la UI y la validación server-side lo rechaza explícitamente.
- Los slots **no se persisten**. Se generan dinámicamente en runtime combinando `horarioDesde`, `horarioHasta` y `duracionSlot`, y se filtran contra los turnos existentes del día.

---

### `ObraSocial`
Obra social o prepaga que el profesional gestiona en su catálogo. Cada profesional tiene su propio listado.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `profesionalId` | `String` | Referencia al profesional que la creó |
| `nombre` | `String` | Nombre de la obra social (unique por profesional) |
| `activo` | `Boolean` | Soft delete — `false` = desactivada |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Última actualización |

**Relaciones:**
- Pertenece a un `Profesional`
- Tiene muchos `Paciente` (1:N)

**Decisiones:**
- Per-profesional: cada profesional gestiona su propio catálogo (mismo patrón que `Paciente`).
- `@@unique([profesionalId, nombre])` evita duplicados de nombre por profesional.
- "Particular" se auto-crea al listar obras sociales si el profesional no tiene ninguna.
- Soft delete con `activo: false`. Al desactivar, los pacientes vinculados conservan su registro pero pierden la referencia (FK `ON DELETE SET NULL`).

---

### `Paciente`
Paciente dado de alta por el profesional. No tiene acceso al sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `profesionalId` | `String` | Referencia al profesional que lo dio de alta |
| `obraSocialId` | `String?` | Referencia a la obra social del paciente (opcional) |
| `nombre` | `String` | Nombre completo |
| `telefono` | `String?` | Teléfono de contacto (opcional) |
| `notas` | `String?` | Notas internas del profesional (opcional) |
| `activo` | `Boolean` | Soft delete — `false` = desactivado |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Última actualización |

**Relaciones:**
- Pertenece a un `Profesional`
- Pertenece a una `ObraSocial` (opcional)
- Tiene muchos `Turno` (1:N)

**Decisiones:**
- `activo: Boolean` implementa soft delete. Nunca se eliminan registros físicamente.
- Las consultas de listado siempre filtran por `activo: true` por defecto.
- Los turnos históricos de un paciente desactivado se conservan íntegros.
- `telefono` es opcional porque no todos los contextos lo requieren, pero se incluye desde el inicio por ser dato crítico en salud.
- `obraSocialId` es opcional. Al desactivar una obra social, los pacientes quedan sin referencia (FK `SET NULL`) pero no se pierden.

---

### `Turno`
Reserva de un slot de tiempo para un paciente con un profesional.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `profesionalId` | `String` | Referencia al profesional |
| `pacienteId` | `String` | Referencia al paciente |
| `fecha` | `DateTime` | Fecha del turno (sin hora — solo la fecha) |
| `horaInicio` | `String` | Hora de inicio del slot (ej. "09:00") |
| `horaFin` | `String` | Hora de fin calculada (ej. "09:30") |
| `estado` | `EstadoTurno` | Estado actual del turno (enum) |
| `notas` | `String?` | Notas internas sobre el turno (opcional) |
| `createdAt` | `DateTime` | Fecha de creación |
| `updatedAt` | `DateTime` | Última actualización |

**Relaciones:**
- Pertenece a un `Profesional`
- Pertenece a un `Paciente`

**Decisiones:**
- `horaInicio` y `horaFin` se guardan como `String` en formato `"HH:mm"` por las mismas razones que en `ConfiguracionProfesional`.
- `horaFin` se calcula al crear el turno sumando `duracionSlot` a `horaInicio` y se persiste. Esto evita recalcular en cada consulta.
- `fecha` se almacena como `DateTime`. Para evitar errores debido a los desfases de zona horaria (UTC vs hora local de Argentina), se normalizará siempre la fecha al inicio del día (`00:00:00.000Z` UTC) al guardar y buscar en la base de datos.
- No existe campo `duracion` — la duración se infiere de `horaInicio` y `horaFin`.
- La validación de solapamiento no es necesaria al crear el turno tradicionalmente porque el formulario solo muestra slots libres. Sin embargo, al modificar la duración del slot (`duracionSlot` en `ConfiguracionProfesional`), se debe restringir el cambio si existen turnos pendientes activos programados en el futuro.

---

### `Feriado`
Feriados nacionales argentinos pre-cargados desde la API pública.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (cuid) | ID interno |
| `fecha` | `DateTime` (unique) | Fecha del feriado (única para evitar duplicados) |
| `nombre` | `String` | Nombre del feriado (ej. "Día de la Independencia") |
| `createdAt` | `DateTime` | Fecha de carga |

**Decisiones:**
- Sin relación con `Profesional` — los feriados son globales para todos.
- La carga se hace de forma automática en segundo plano (ej. al iniciar la aplicación si no se detectan feriados en el año actual).
- Se quita el campo `año` por ser redundante (se deduce de `fecha`). Para buscar feriados por año, se filtra por rango de fechas de ese año.
- **Nunca se consulta la API en runtime.** El calendario y el chat leen siempre desde esta tabla.

---

## Enum

### `EstadoTurno`

```
enum EstadoTurno {
  PENDIENTE
  CONFIRMADO
  CANCELADO
  AUSENTE
}
```

| Valor | Descripción |
|---|---|
| `PENDIENTE` | Turno creado, sin confirmar |
| `CONFIRMADO` | Turno confirmado por el profesional |
| `CANCELADO` | Turno cancelado antes de la fecha |
| `AUSENTE` | El paciente no se presentó |

**Decisiones:**
- `CANCELADO` y `AUSENTE` son estados distintos con semántica diferente: uno es una acción proactiva, el otro es un hecho posterior al turno. Separarlos permite estadísticas más precisas en el futuro.

---

## Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum EstadoTurno {
  PENDIENTE
  CONFIRMADO
  CANCELADO
  AUSENTE
}

model Profesional {
  id            String                    @id @default(cuid())
  clerkId       String                    @unique
  nombre        String
  email         String                    @unique
  configuracion ConfiguracionProfesional?
  pacientes     Paciente[]
  obrasSociales ObraSocial[]
  turnos        Turno[]
  createdAt     DateTime                  @default(now())
  updatedAt     DateTime                  @updatedAt
}

model ConfiguracionProfesional {
  id              String      @id @default(cuid())
  profesionalId   String      @unique
  profesional     Profesional @relation(fields: [profesionalId], references: [id])
  duracionSlot    Int
  horarioDesde    String
  horarioHasta    String
  diasLaborables  Int[]       @default([1,2,3,4,5,6])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model ObraSocial {
  id            String      @id @default(cuid())
  profesionalId String
  profesional   Profesional @relation(fields: [profesionalId], references: [id])
  nombre        String
  activo        Boolean     @default(true)
  pacientes     Paciente[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([profesionalId, nombre])
}

model Paciente {
  id            String      @id @default(cuid())
  profesionalId String
  profesional   Profesional @relation(fields: [profesionalId], references: [id])
  obraSocialId  String?
  obraSocial    ObraSocial? @relation(fields: [obraSocialId], references: [id])
  nombre        String
  telefono      String?
  notas         String?
  activo        Boolean     @default(true)
  turnos        Turno[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Turno {
  id            String      @id @default(cuid())
  profesionalId String
  profesional   Profesional @relation(fields: [profesionalId], references: [id])
  pacienteId    String
  paciente      Paciente    @relation(fields: [pacienteId], references: [id])
  fecha         DateTime
  horaInicio    String
  horaFin       String
  estado        EstadoTurno @default(PENDIENTE)
  notas         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Feriado {
  id        String   @id @default(cuid())
  fecha     DateTime @unique
  nombre    String
  createdAt DateTime @default(now())
}
```

---

## Notas para el agente

- Nunca eliminar registros de `Paciente` ni `ObraSocial` físicamente. Usar `activo: false`.
- Los slots no se guardan en la base de datos. Se generan en runtime.
- `horaFin` siempre se calcula al crear el turno, nunca se deja vacío.
- Antes de correr cualquier migración, describir los cambios y esperar aprobación.
- La tabla `Feriado` no tiene relación con `Profesional` — es global e intocable en runtime.
- `diasLaborables` excluye domingo (0) — validado en UI y server. No se debe permitir nunca.
- La config base se auto-crea al registrar un nuevo profesional. `getCurrentProfesional()` siempre retorna config poblada.
- "Particular" se auto-crea para cada profesional al listar obras sociales si no tiene ninguna.
- `ObraSocial` tiene unique compuesto `[profesionalId, nombre]` — no crear duplicados.