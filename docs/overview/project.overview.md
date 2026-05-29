# 🧠 Núcleo del proyecto — medical-appointments
> Documento conceptual de referencia para la defensa final.
> Resume qué es el proyecto, por qué se construyó así y cómo se tomaron las decisiones.

---

## 1. ¿Qué es medical-appointments?

Una aplicación web para profesionales de la salud que permite gestionar turnos de dos formas complementarias:

- **Modo tradicional:** un calendario visual donde el profesional crea, consulta y cancela turnos de forma directa.
- **Modo chat con IA:** un asistente conversacional que permite consultar y operar sobre los turnos usando lenguaje natural o botones de acceso rápido.

El sistema no tiene portal para pacientes. El profesional es el único usuario. Los pacientes son dados de alta por el profesional dentro de la app.

---

## 2. ¿Qué problema resuelve?

Los sistemas de turnos médicos existentes suelen ser complejos, lentos de operar o requieren navegar múltiples pantallas para responder preguntas simples como "¿tengo algo el jueves a la tarde?" o "¿hay slots libres esta semana?".

medical-appointments propone una interfaz de calendario clara para la gestión visual, y un chat como atajo inteligente para consultas rápidas, sin reemplazar el flujo tradicional sino complementándolo.

---

## 3. ¿Para quién es?

Profesional de la salud independiente (médico, psicólogo, odontólogo, etc.) que gestiona su propia agenda y quiere una herramienta simple, rápida y accesible desde cualquier dispositivo.

---

## 4. Stack tecnológico y por qué

| Tecnología | Rol | Por qué se eligió |
|---|---|---|
| Next.js (App Router) | Framework principal | SSR, rutas de API integradas, estándar moderno |
| Clerk | Autenticación | Integración nativa con Next.js, UI lista, sin fricción |
| Neon | Base de datos (PostgreSQL) | Plan gratuito generoso, mismo motor que Supabase, fácil migración futura |
| Prisma | ORM | Type-safe, migraciones claras, compatible con Neon |
| Tailwind CSS | Estilos | Utilidades, rapidez, sin CSS custom innecesario |
| shadcn/ui | Componentes UI | Componentes accesibles y personalizables sobre Tailwind |
| Groq API | LLM del chat | Capa gratuita generosa, suficiente para consultas simples, bajo costo |

---

## 5. Metodología de desarrollo: MoSCoW + Features

### ¿Qué es MoSCoW?
Un método de priorización que clasifica cada funcionalidad en cuatro categorías:

- **Must Have:** imprescindible. Sin esto la app no existe.
- **Should Have:** importante. Le da valor real al producto.
- **Could Have:** deseable. Se incluye si hay tiempo.
- **Won't Have:** fuera del alcance actual. Documentado como mejora futura.

### ¿Qué es desarrollo por features?
Construir el proyecto en unidades funcionales completas. Cada feature es una capacidad de la app que funciona de punta a punta antes de pasar a la siguiente. No se avanza con features rotas o a medias.

### ¿Cómo se combinan?
MoSCoW decide el **orden de prioridad**. El desarrollo por features decide la **unidad de trabajo**. Cada feature tiene asignada una prioridad MoSCoW. Se construyen primero todos los Must Have, luego los Should Have, y así sucesivamente.

---

## 6. Decisiones de diseño clave

### Slots fijos en lugar de duración libre
El profesional configura una duración de slot única (ej. 30 minutos). El sistema genera automáticamente los bloques disponibles del día. Si un slot está ocupado, no aparece como opción. Esto elimina la posibilidad de que dos turnos se superpongan. Se restringe cambiar la duración de slots si hay turnos pendientes futuros.

### Feriados pre-cargados y sincronización automática
Los feriados nacionales se guardan en la tabla `Feriado` de la base de datos con un índice único para evitar duplicaciones. Su carga se realiza automáticamente en segundo plano en el arranque si no existen feriados cargados para el año en curso. Nunca se consulta la API de feriados en runtime.

### Soft delete en pacientes
Los pacientes nunca se eliminan físicamente. Se desactivan (`activo: false`). Esto preserva el historial de turnos y la integridad de los datos, lo cual es especialmente importante en un sistema de salud.

### Creación rápida de paciente en modal secundario
Si el paciente no existe al momento de agendar, el profesional lo crea mediante un modal/diálogo rápido en la misma pantalla usando Server Actions. Al registrarse, se selecciona automáticamente en el formulario, evitando redirecciones y pérdidas de estado del calendario.

### Domingos visibles pero deshabilitados en el calendario
Los domingos se muestran en el calendario para conservar un diseño de rejilla tradicional, simétrico y profesional, pero la interacción está deshabilitada de forma que no sea posible agendar citas en ese día.

### Sincronización Clerk bajo demanda (Lazy initialization)
Para evitar la complejidad y los fallos de red de Clerk Webhooks en el desarrollo local, el profesional se registra en la base de datos local bajo demanda en su primer ingreso a través de un helper backend (`getCurrentProfesional`).

### Chat con botones de acceso directo e historial acotado
Las acciones comunes (ej: ver turnos de hoy) se ejecutan con botones directos sin llamar al LLM. Para preguntas de seguimiento que sí pasen por el LLM, el historial de contexto se limita a los últimos 6 mensajes (3 turnos) para un consumo óptimo de tokens.

---

## 7. Architecture Decision Records (ADR)

### ¿Qué son?
Anotaciones breves que documentan una decisión técnica o de diseño: qué se decidió, por qué, y qué alternativas se descartaron.

### ¿Para qué sirven en este proyecto?
- Evitan contradicciones durante el desarrollo al tener las decisiones escritas.
- Facilitan la escritura de la memoria de desarrollo al final.
- Permiten responder con fundamento las preguntas del tribunal en la defensa.

### Decisiones registradas
| # | Decisión |
|---|---|
| ADR-001 | Groq como proveedor del LLM |
| ADR-002 | Neon como base de datos |
| ADR-003 | Clerk para autenticación |
| ADR-004 | Slots fijos en lugar de duración libre |
| ADR-005 | Feriados pre-cargados y sincronizados automáticamente en DB |
| ADR-006 | Soft delete en pacientes |
| ADR-007 | Creación de paciente desde modal rápido (sub-diálogo) |
| ADR-008 | Límite de historial del chat (últimos 6 mensajes / 3 turnos) |
| ADR-009 | Sincronización de Clerk sin Webhooks (getCurrentProfesional) |
| ADR-010 | Visibilidad de domingos bloqueados en el calendario |
| ADR-011 | Restricción de cambio de duración de slot |

---

## 8. Alcance del MVP y límites conscientes

### Qué hace la app
- Gestión completa de turnos (crear, ver, cancelar, cambiar estado)
- ABM de pacientes
- Calendario mensual y semanal con feriados pintados
- Chat con IA para consultas y acciones rápidas
- Auth segura para el profesional

### Qué no hace (y por qué está bien así)
- **No tiene portal para pacientes:** simplifica radicalmente el sistema. Los pacientes no necesitan cuenta para ser atendidos.
- **No envía notificaciones:** agrega dependencias externas (mail, WhatsApp) que están fuera del alcance del MVP.
- **No maneja múltiples profesionales con roles:** un solo profesional autenticado es suficiente para validar el producto.
- **No tiene historia clínica:** está fuera del dominio de un sistema de turnos.

> Construir pequeño, probar pronto, mejorar con intención. Un MVP sólido que resuelve bien un problema concreto vale más que un sistema grande que resuelve mal muchos.

---

## 9. Uso de IA en el desarrollo

La IA fue utilizada como copiloto en todas las etapas:

- **Ideación y diseño:** definición del alcance, detección de problemas en el plan, decisiones de arquitectura.
- **Desarrollo:** generación de código, revisión de lógica, refactorización.
- **Documentación:** estructura de documentos, redacción de decisiones técnicas.

El uso de IA no reemplazó el criterio propio. Cada decisión fue evaluada, cuestionada y aceptada o descartada con fundamento. Los ADR registran ese proceso.

---

## 10. Mejoras futuras

- Configuración de días laborables por profesional (hoy el domingo está bloqueado por defecto)
- Notificaciones por mail o WhatsApp al crear o cancelar un turno
- Portal para pacientes con vista de sus propios turnos
- Múltiples profesionales con roles y permisos diferenciados
- Historia clínica básica por paciente
- Turnos recurrentes
- Integración con sistemas de pago