# 🧭 Ayuda Memoria — medical-appointments

> Mapa conceptual de decisiones, flujo de trabajo y arquitectura.
> Para entender rápido cómo está pensado el proyecto y poder explicarlo.

---

## 1. ⚙️ Cómo se toman las decisiones

Cada decisión sigue una estructura fija (ADR):

```
Problema / Necesidad
      │
      ▼
   Propuesta de solución
      │
      ▼
   Alternativas consideradas  ─── ¿Por qué se descartaron?
      │
      ▼
   Decisión adoptada
      │
      ▼
   Consecuencias (qué implica)
```

**Formato ADR** — cada decisión queda registrada en `docs/overview/project.decisions.md` con:
- Título corto
- Fecha y estado
- **Decisión:** qué se hizo
- **Por qué:** justificación
- **Alternativas descartadas:** opciones que se consideraron y por qué se rechazaron
- **Consecuencias:** implicaciones hacia adelante

---

## 2. 🗂️ Priorización: MoSCoW + Features

| Prioridad | Significado | Features |
|---|---|---|
| 🔴 **Must Have** | Imprescindible — sin esto no hay app | Setup, Modelo de datos, ABM Pacientes, Gestión de Turnos, Calendario, Chat IA base |
| 🟡 **Should Have** | Importante — da valor real | Tools de acción en chat, Feriados en chat, Filtros en agenda, Estados mejorados |
| 🟢 **Could Have** | Deseable — si sobra tiempo | Notas por turno, Buscador global, Resumen diario en chat |
| ⚫ **Won't Have** | Fuera del MVP | Notificaciones, Portal pacientes, Multi-profesional, Historia clínica |

### Regla de oro del desarrollo
**Una feature a la vez, punta a punta.** No se empieza la siguiente hasta que la actual funciona 100%.

### Definition of Done
- Funcionalidad completa (todos los casos de uso)
- Proyecto compila sin errores (TypeScript + linter)
- UI renderiza sin errores ni pantallas en blanco

---

## 3. 📋 Decisiones registradas (ADR) — resumen rápido

| # | Decisión | Clave |
|---|---|---|
| ADR-001 | **Groq** como LLM | Capa gratuita generosa — suficiente para consultas simples |
| ADR-002 | **Neon** como DB | PostgreSQL real, plan gratuito, mismo motor que Supabase |
| ADR-003 | **Clerk** para auth | Integración nativa Next.js, UI lista |
| ADR-004 | **Slots fijos** (no duración libre) | Elimina solapamientos — si un slot está ocupado, no aparece |
| ADR-005 | **Feriados en DB** pre-cargados | Nunca se consulta API externa en runtime — sync automático al arrancar |
| ADR-006 | **Soft delete** en pacientes | `activo: boolean` — nunca se eliminan físicamente |
| ADR-007 | **Modal rápido** para crear paciente | Sub-diálogo en la misma pantalla — no se pierde el slot seleccionado |
| ADR-008 | **Historial chat limitado** a 6 mensajes | Últimos 3 turnos — contexto justo sin inflar tokens |
| ADR-009 | **Clerk lazy** sin webhooks | `getCurrentProfesional()` — crea el profesional en DB al primer ingreso |
| ADR-010 | **Domingos visibles** pero deshabilitados | UI simétrica, interacción bloqueada |
| ADR-011 | **Restricción cambio duración slot** | No se permite si hay turnos pendientes futuros — evita solapamientos |
| ADR-012 | **Lógica feriados separada** del `'use server'` | `lib/feriados.ts` (pura) + `lib/actions/feriados.ts` (wrapper) |

---

## 4. 🏗️ Arquitectura del proyecto

### Rutas
```
/                        → Landing page (pública)
/dashboard               → Home del dashboard (protegida)
/dashboard/agenda        → Calendario (mensual + semanal)
/dashboard/pacientes     → ABM pacientes
/dashboard/chat          → Chat con IA
/dashboard/configuracion → Configuración del profesional
```

### Stack
```
Next.js (App Router)  ← Framework
  ├── Clerk           ← Auth (sesión + middleware)
  ├── Prisma          ← ORM
  ├── Neon            ← PostgreSQL
  ├── Tailwind        ← Estilos
  ├── shadcn/ui       ← Componentes UI
  └── Groq API        ← LLM del chat
```

### Capas del código
```
src/
  app/               → Rutas y layouts
  actions/           → Server Actions (mudanzas de datos)
  components/
    ui/              → shadcn/ui (no tocar)
    landing/         → Componentes de la landing
    dashboard/       → Sidebar, header, layout
    agenda/          → Calendario (month + week view)
  lib/               → Lógica pura, helpers, Prisma client
  types/             → Tipos compartidos
```

---

## 5. 🔁 Flujo de trabajo típico

```
1. Definir feature (docs/overview/project.features.md)
       │
2. Verificar ADRs que aplican (docs/overview/project.decisions.md)
       │
3. Implementar Server Components primero
       │
4. Agregar Server Actions para mutaciones
       │
5. Agregar Client Components solo donde se necesita interactividad
       │
6. Verificar:
   ├── Compila (TypeScript)
   ├── Linter OK
   └── UI funciona
       │
7. Pasar a la siguiente feature
```

---

## 6. 🚫 Reglas que no se negocian

| Regla | Por qué |
|---|---|
| **Nunca `any`** | Type safety es obligatorio |
| **Nunca hard delete** | Soft delete con `activo: boolean` — preserva historial |
| **Nunca slots en DB** | Se generan dinámicamente en runtime |
| **Nunca feriados API en runtime** | Solo se lee de tabla `Feriado` |
| **Nunca migraciones sin aprobación** | Describir primero, migrar después |
| **Nunca npm install sin preguntar** | Primero verificar si existe en shadcn/ui |
| **Server Components por defecto** | Solo usar `"use client"` cuando es necesario |

---

## 7. 📊 Modelo de datos (relaciones)

```
Profesional (1) ─── (1) ConfiguracionProfesional
    │
    ├── (N) Paciente ─── (N) Turno
    │
    └── (N) Turno

Feriado (global — sin relación con profesional)
```

### Puntos clave del schema
- `horaInicio` y `horaFin` como `String "HH:mm"` — sin tipos Time de PostgreSQL
- `fecha` como `DateTime` normalizada a UTC `00:00:00.000Z`
- `horaFin` se calcula sumando `duracionSlot` a `horaInicio` al crear el turno
- Estados: `PENDIENTE → CONFIRMADO → CANCELADO | AUSENTE`

---

## 8. 💬 Chat IA — cómo funciona

```
Botón directo ───────────────────────────→ Tool (sin LLM)
                                                │
Pregunta en lenguaje natural ──→ Groq API ──→ Tool
                                                │
                                           Respuesta al usuario
                                                │
                                        Historial: últimos 6 mensajes
                                        Se envía en cada request
```

- Los botones de acceso rápido NO pasan por el LLM
- El historial se limita a 6 mensajes (3 turnos) para ahorrar tokens
- Siempre se incluye system prompt contextualizando al asistente

---

## 9. 🔐 Sincronización de Clerk (lazy)

```
Usuario se loguea con Clerk
       │
       ▼
getCurrentProfesional() verifica si existe en DB
       │
       ├── Sí → devuelve el profesional
       │
       └── No → lo crea automáticamente y luego devuelve
```

Sin webhooks, sin ngrok, sin configuración extra en desarrollo.

---

## 10. 📐 Principios de UI

| Principio | Aplica a |
|---|---|
| Títulos en `font-serif` (Georgia, weight 400) | Todos los headings |
| Contenido en `font-sans` (DM Sans) | Párrafos, labels, botones |
| Código en `font-mono` (Fira Code) | Bloques de código |
| Serif nunca usa bold/semibold | Titulares siempre regular |
| Destacar texto → usar `text-accent` | En lugar de bold |
| Paleta Catppuccin | Latte (light) / Mocha (dark) |
| Sidebar fija 256px | Layout del dashboard |
| Domingos visibles pero no clickeables | Calendario |
| Slots libres son los únicos seleccionables | Creación de turno |

---

> **¿Nueva decisión?** Agregarla a `docs/overview/project.decisions.md` usando la plantilla ADR.
> **¿Nuevo documento?** Evaluar si debe listarse en `AGENTS.md`.
