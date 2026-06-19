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
- [x] Mostrar solo slots libres al crear un turno (slots ocupados con PENDIENTE/CONFIRMADO no aparecen; CANCELADO/AUSENTE sí están disponibles)
- [x] Server Action `crearTurno` con validaciones (domingo, feriado, rango horario, días laborables, sin superposición)
- [x] Botón global "Nuevo turno" en Topbar (disponible en todas las vistas del dashboard)
- [x] Modal `CrearTurnoModal` con `@base-ui/react` Dialog:
  - Selector de fecha con shadcn Popover + Calendar (react-day-picker) y hora con `<select>` personalizado de slots del profesional
  - Slots ocupados filtrados dinámicamente vía `getSlotsOcupadosEnFecha`
  - Selector de paciente con búsqueda integrada (filtra mientras se escribe)
  - Datos del paciente mostrados al seleccionarlo (nombre, teléfono, obra social)
  - Opción fija "＋ Crear nuevo paciente" que abre formulario inline con nombre, teléfono y obra social (invoca Server Action `crearPaciente`)
  - Al crearse con éxito, se selecciona automáticamente el paciente en el selector
- [x] Modal de detalle al clickear un bloque ocupado (vista semanal):
  - Datos del turno (fecha, hora, estado con badge)
  - Datos del paciente (nombre, teléfono, notas si existen)
  - Acciones: Confirmar, Cancelar (con confirmación inline), Marcar ausente
- [x] Estados del turno: PENDIENTE → CONFIRMADO / CANCELADO; CONFIRMADO → CANCELADO / AUSENTE; CANCELADO/AUSENTE → CONFIRMADO
- [x] Cancelar turno con confirmación inline dentro del mismo modal (sin AlertDialog anidado)

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

### FEATURE 4C — ABM de obras sociales
- [x] Listar obras sociales activas del profesional (con contador de pacientes vinculados)
- [x] Crear obra social (nombre obligatorio)
- [x] Editar obra social
- [x] Desactivar obra social (soft delete — FK `SET NULL` en pacientes vinculados)
- [x] Búsqueda por nombre dentro del listado
- [x] "Particular" auto-creada al listar si el profesional no tiene ninguna
- [x] Vista responsive (tabla desktop + tarjetas mobile) mismo diseño que pacientes

---

### FEATURE 5 — Vista de agenda (calendario)
- [x] Vista mensual navegable (mes anterior / mes siguiente)
- [x] Vista semanal navegable (semana anterior / semana siguiente)
  - Muestra los 7 días de la semana
  - Domingo visible en el calendario para mantener la UI simétrica, pero bloqueado/deshabilitado para clicks o creación de turnos
- [x] Feriados pintados visualmente en ambas vistas (leídos desde tabla `Feriado`, sin llamadas externas)
- [x] Turnos visibles en el calendario con indicadores de color por estado (pendiente, confirmado, cancelado, ausente)
- [x] Click en bloque ocupado → modal de detalle del turno (Feature 4)

---

### FEATURE 6 — Chat IA — Setup y tools base
- [x] Configurar Groq API en el proyecto
- [x] Definir system prompt base que contextualice al modelo como asistente de turnos médicos
- [x] Manejar historial de conversación: enviar últimos 6 mensajes (3 turnos completos) en cada request para mantener contexto sin inflar consumo de tokens
- [x] No llamar al LLM si una acción puede resolverse directamente con datos (los botones de acceso directo van a la tool sin pasar por el modelo)
- [x] Crear interfaz de chat (modal global accesible desde la Topbar, burbujas de mensajes, input de texto, scroll automático, respuestas en Markdown)
- [x] Botones de acceso directo visibles en el chat (disparan tools directamente sin interpretación de lenguaje natural):
  - Ver turnos de hoy
  - Ver disponibilidad
  - Consultar feriados
- [x] Implementar tool: `buscar_turnos` (por fecha, paciente o estado)
- [x] Implementar tool: `consultar_disponibilidad` (slots libres para una fecha dada)
- [x] El chat responde solo con datos reales de la base

---

## 🟡 SHOULD HAVE — Le da valor real al producto

### FEATURE 7 — Chat IA — Tools de acción + polish UX
- [x] Implementar tool: `crear_turno` desde lenguaje natural:
  - Búsqueda de paciente por nombre (coincidencia parcial, insensitive)
  - Validación de slot (domingo, feriado, día laborable, rango horario, sin superposición)
  - Si hay múltiples pacientes o turnos, el LLM pide clarificación
  - Ejecución real tras confirmación del profesional
- [x] Implementar tool: `cancelar_turno` desde lenguaje natural:
  - Búsqueda de paciente + fecha
  - Validación de existencia del turno activo
  - Ejecución real tras confirmación del profesional
- [x] Confirmación de acciones destructivas: botones Sí / No dentro del propio chat, no modal externo
- [x] Feedback claro en el chat cuando una acción se completó o falló
- [x] Polish UX:
  - ToolDropdown reemplazó Quick Actions (único botón 🔧 con dropdown de 5 tools)
  - ChatOnboarding: tooltip con overlay oscuro, flecha apuntando al botón 🔧
  - Onboarding oscurece solo el área del modal (bg-black/40), igual que el backdrop
  - Responsive modal: fullscreen en mobile, con bordes en desktop
  - Sin bordes separadores entre secciones (title, chat, actions)
  - Mensaje vacío centrado verticalmente en el área de chat
  - Botón "No volver a mostrar" y "Entendido" en fila horizontal
  - Icono Wrench de lucide-react en tooltip (mismo que el botón)

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
- [x] Distinguir claramente turno "ausente" del turno "cancelado" en la interfaz
  - Ausente: badge naranja, visible en calendario (registro de inasistencia)
  - Cancelado: badge rojo, oculto del calendario (slot se libera y aparece como disponible)

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
- Click en bloque libre del calendario → abre modal de creación con fecha y slot pre-cargados
- Click en día del calendario mensual → navega a la vista semanal de esa semana

---

## 📌 Notas de desarrollo

- Cada feature se considera terminada cuando funciona de punta a punta, no solo cuando está "casi lista".
- Usar la IA para generar, revisar y refactorizar código — registrar prompts útiles.
- No pasar a la siguiente feature con bugs bloqueantes en la actual.
- El chat no maneja casos ambiguos: si no entiende, pide clarificación concreta.
- Los botones de acceso directo del chat disparan tools directamente — no pasan por el LLM innecesariamente.
- La tabla `Feriado` es la única fuente de verdad para feriados en toda la app — nunca consultar la API externa en runtime.
- Los slots se generan dinámicamente desde `ConfiguracionProfesional` — nunca guardar slots vacíos en la base de datos.
- Los turnos CANCELADO se ocultan del calendario y el slot se libera para re-asignación. Los turnos AUSENTE permanecen visibles como registro de inasistencia.