# 🗂️ Plan de desarrollo — Sistema de Turnos con IA
> Enfoque: MoSCoW + desarrollo por features
> Stack: Next.js · Clerk · Neon · Prisma · Tailwind · shadcn/ui · Groq API

---

## 🔴 MUST HAVE — El núcleo sin el cual no existe la app

### FEATURE 1 — Setup del proyecto
- [ ] Inicializar proyecto Next.js con App Router
- [ ] Configurar Tailwind + shadcn/ui
- [ ] Conectar Neon (crear base de datos)
- [ ] Configurar Prisma (schema inicial + primera migración)
- [ ] Configurar Clerk (login, sesión, middleware de protección de rutas)
- [ ] Variables de entorno organizadas (`.env.local`)

---

### FEATURE 2 — Modelo de datos base
- [x] Definir schema Prisma:
  - `Profesional` (vinculado al usuario de Clerk)
  - `ConfiguracionProfesional` (duración del slot en minutos, horario de atención desde/hasta)
  - `Paciente` (nombre, teléfono, notas, activo: boolean — soft delete desde el inicio)
  - `Turno` (fecha: DateTime, horaInicio, horaFin calculada, estado, paciente, profesional)
  - `Feriado` (fecha: DateTime unique, nombre)
- [x] Correr migraciones
- [x] Seedear datos de prueba con `prisma/seed.ts` (1 profesional + usuario Clerk automático, 6 pacientes, 10 turnos)
- [x] Carga inicial de feriados argentinos desde la API pública (guardados en tabla `Feriado`, no consultar en cada render) con un índice único en fecha para evitar duplicados
- [x] Sincronización automática de feriados del año actual en el arranque si la base está vacía (sin botones manuales)

---

### FEATURE 3 — ABM de pacientes
- [x] Listar pacientes activos del profesional
- [x] Crear paciente (formulario con validación — nombre obligatorio, teléfono opcional)
- [x] Editar paciente
- [x] Desactivar paciente (soft delete — nunca borrar si tiene turnos históricos)
- [x] Búsqueda básica por nombre dentro del listado

---

### FEATURE 4 — Gestión de turnos (modo tradicional)
- [x] Lógica de generación de slots: dado un día, generar todos los bloques disponibles según `ConfiguracionProfesional` (horario de atención + duración de slot)
- [ ] Mostrar solo slots libres al crear un turno (slots ocupados no aparecen como opción)
- [x] Server Action `crearTurno` con validaciones (domingo, feriado, rango horario, días laborables, sin superposición)
- [x] Botón global "Nuevo turno" en Topbar (disponible en todas las vistas del dashboard)
- [x] Modal `CrearTurnoModal` con `@base-ui/react` Dialog:
  - Selector de fecha con shadcn Popover + Calendar (react-day-picker) y hora con `<select>` personalizado de slots del profesional
  - Selector de paciente con búsqueda integrada (filtra mientras se escribe)
  - Opción fija "＋ Crear nuevo paciente" que abre formulario inline (invoca Server Action `crearPaciente`)
  - Al crearse con éxito, se selecciona automáticamente el paciente en el selector
- [ ] Crear turno desde modal al clickear un bloque libre en el calendario (fecha y slot pre-cargados)
- [ ] Modal de detalle al clickear un bloque ocupado:
  - Datos del turno (fecha, hora, estado)
  - Datos del paciente
  - Acciones disponibles: cambiar estado, cancelar turno (con confirmación)
- [ ] Estados del turno: pendiente → confirmado → cancelado / ausente
- [ ] Cancelar turno con confirmación explícita antes de ejecutar

### FEATURE 4B — Configuración del consultorio
- [x] Página `/dashboard/configuracion` con formulario completo:
  - Días laborables (lun–sáb, domingo hard-bloqueado, no aparece en UI)
  - Horario de atención desde/hasta (select c/30 min, 06:00–22:00)
  - Duración del turno (select 15–60 min)
  - Botón guardar estilo `rounded-full bg-primary` (mismo que "Nuevo turno" en Topbar)
  - Form en `rounded-lg border border-border p-6` (mismo estilo que tabla de pacientes)
  - Contenedor `max-w-lg` alineado a la izquierda
- [x] Server Action `actualizarConfiguracion` con validaciones (ADR-011 + rango horario)
- [x] Config base auto-creada al registrarse (08:00–19:00, 30 min, lun–sáb)
- [x] Campo `diasLaborables` en schema + migración
- [x] Calendar popover del modal deshabilita días no laborables y domingos
- [x] Vistas de calendario (WeekView, MonthView, DayCard) reaccionan visualmente a cambios en configuración

---

### FEATURE 5 — Vista de agenda (calendario)
- [x] Vista mensual navegable (mes anterior / mes siguiente)
- [x] Vista semanal navegable (semana anterior / semana siguiente)
  - Muestra los 7 días de la semana
  - Domingo visible en el calendario para mantener la UI simétrica, pero bloqueado/deshabilitado para clicks o creación de turnos
- [x] Feriados pintados visualmente en ambas vistas (leídos desde tabla `Feriado`, sin llamadas externas)
- [x] Turnos visibles en el calendario con indicadores de color por estado (pendiente, confirmado, cancelado, ausente)
- [ ] Click en bloque libre → modal de creación de turno (Feature 4)
- [ ] Click en bloque ocupado → modal de detalle del turno (Feature 4)
- [ ] Click en día del calendario mensual → navega a la vista semanal de esa semana

---

### FEATURE 6 — Chat IA — Setup y tools base
- [ ] Configurar Groq API en el proyecto
- [ ] Definir system prompt base que contextualice al modelo como asistente de turnos médicos
- [ ] Manejar historial de conversación: enviar últimos 6 mensajes (3 turnos completos) en cada request para mantener contexto sin inflar consumo de tokens
- [ ] No llamar al LLM si una acción puede resolverse directamente con datos (los botones de acceso directo van a la tool sin pasar por el modelo)
- [ ] Crear interfaz de chat (burbujas de mensajes, input de texto, scroll automático)
- [ ] Botones de acceso directo visibles en el chat (disparan tools directamente sin interpretación de lenguaje natural):
  - Ver turnos de hoy
  - Ver disponibilidad
  - Consultar feriados
- [ ] Implementar tool: `buscar_turnos` (por fecha, paciente o estado)
- [ ] Implementar tool: `consultar_disponibilidad` (slots libres para una fecha dada)
- [ ] El chat responde solo con datos reales de la base

---

## 🟡 SHOULD HAVE — Le da valor real al producto

### FEATURE 7 — Chat IA — Tools de acción
- [ ] Implementar tool: `crear_turno` desde lenguaje natural o desde botón directo
- [ ] Implementar tool: `cancelar_turno` — accionada desde botón directo con el turno en contexto
- [ ] Confirmación de acciones destructivas: botones Sí / No dentro del propio chat, no modal externo
- [ ] Feedback claro en el chat cuando una acción se completó o falló

---

### FEATURE 8 — Feriados en el chat
- [ ] Implementar tool: `consultar_feriados` ("¿es feriado esta semana?", "¿qué feriados hay en mayo?")
- [ ] El chat advierte si se intenta crear un turno en un día feriado
- [ ] Los datos se leen desde la tabla `Feriado` (ya cargada en Feature 2, sin llamadas externas)

---

### FEATURE 9 — Filtros y mejoras en la agenda
- [ ] Filtrar turnos por estado en la vista semanal
- [ ] Filtrar turnos por paciente
- [ ] Indicador de cantidad de turnos del día en el header o en la vista mensual

---

### FEATURE 10 — Estados y flujo de turno mejorado
- [ ] Distinguir claramente turno "ausente" del turno "cancelado" en la interfaz

---

## 🟢 COULD HAVE — Si sobra tiempo y energía

### FEATURE 11 — Notas por turno
- [ ] Campo de notas internas en cada turno
- [ ] Visible solo para el profesional
- [ ] Editable desde el modal de detalle

---

### FEATURE 12 — Buscador global
- [ ] Buscar desde cualquier pantalla (pacientes + turnos)
- [ ] Resultados agrupados por tipo
- [ ] Acceso rápido con atajo de teclado (⌘K / Ctrl+K)

---

### FEATURE 13 — Tool de resumen diario en el chat
- [ ] "¿Cómo tengo el día de hoy?" → resumen con todos los turnos del día
- [ ] "¿Cuántos turnos tuve esta semana?" → estadística simple

---

## ⚫ WON'T HAVE — Fuera del MVP (documentar como mejoras futuras)

- Historial/bitácora de cambios de estado de turnos (se conserva solo el estado actual)
- Sincronización de Clerk mediante Webhooks (se usa inicialización lazy)
- Notificaciones por mail o WhatsApp
- Portal para pacientes (login propio, ver sus turnos)
- Múltiples profesionales con roles y permisos
- Historia clínica completa
- Configuración de días laborables por profesional (el domingo está bloqueado; en el futuro el profesional define qué días atiende)
- Turno recurrente (repetir cada N semanas)

---

## 📌 Notas de desarrollo

- Cada feature se considera terminada cuando funciona de punta a punta, no solo cuando está "casi lista".
- Usar la IA para generar, revisar y refactorizar código — registrar prompts útiles.
- No pasar a la siguiente feature con bugs bloqueantes en la actual.
- El chat no maneja casos ambiguos: si no entiende, pide clarificación concreta.
- Los botones de acceso directo del chat disparan tools directamente — no pasan por el LLM innecesariamente.
- La tabla `Feriado` es la única fuente de verdad para feriados en toda la app — nunca consultar la API externa en runtime.
- Los slots se generan dinámicamente desde `ConfiguracionProfesional` — nunca guardar slots vacíos en la base de datos.