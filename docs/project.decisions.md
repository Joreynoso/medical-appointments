# 📋 Architecture Decision Records — medical-appointments
> Registro de decisiones técnicas y de diseño tomadas durante el desarrollo.
> Cada entrada explica qué se decidió, por qué y qué alternativas se descartaron.
> **Actualizar este documento cada vez que se tome una decisión relevante.**

---

## ADR-001 — Proveedor de LLM: Groq en lugar de Claude API

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Usar Groq como proveedor del LLM para el chat del sistema.

**Por qué:**
La capa gratuita de Groq es suficientemente generosa para las consultas que hace este sistema (búsqueda de turnos, consulta de disponibilidad, feriados). Las consultas son simples y no requieren un modelo de alta capacidad. Minimizar costos es un factor crítico en esta etapa.

**Alternativas descartadas:**
- Claude API (Anthropic): capa gratuita más limitada, costo mayor para uso continuo.
- OpenAI: sin capa gratuita relevante.

**Consecuencias:**
- Hay que ser cuidadoso con la cantidad de llamadas al LLM.
- Los botones de acceso directo del chat disparan tools sin pasar por el modelo para reducir requests innecesarios.
- Si en el futuro se necesita mayor capacidad de razonamiento, la migración a otro proveedor es relativamente simple (cambiar cliente y credenciales).

---

## ADR-002 — Base de datos: Neon en lugar de Supabase

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Usar Neon como base de datos PostgreSQL serverless.

**Por qué:**
La cuenta gratuita de Supabase ya fue consumida en proyectos anteriores. Crear una nueva cuenta implicaría migrar todo en el futuro si se quiere usar Supabase para el portfolio. Neon ofrece PostgreSQL real con plan gratuito generoso y compatible con Prisma sin fricciones.

**Alternativas descartadas:**
- Supabase: cuota gratuita agotada, migración futura compleja.
- PlanetScale: MySQL, no PostgreSQL, menos compatible con el stack elegido.
- Turso: SQLite distribuido, menos convencional y con soporte Prisma más reciente y menos probado.

**Consecuencias:**
- Si en el futuro se quiere migrar a Supabase, es trivial porque ambos son PostgreSQL.
- Se pierde el dashboard visual de Supabase, pero Prisma Studio cubre esa necesidad en desarrollo.

---

## ADR-003 — Autenticación: Clerk

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Usar Clerk para manejar autenticación y sesiones de los profesionales.

**Por qué:**
Clerk ofrece integración nativa con Next.js App Router, manejo de sesiones, middleware de protección de rutas y una UI de login lista para usar. Reduce el tiempo de desarrollo en una parte que no es el core del producto.

**Alternativas descartadas:**
- Pocketbase auth: integrado en Pocketbase, pero Pocketbase y Clerk no conviven bien — se estaría peleando contra la herramienta.
- NextAuth: más configuración manual, más tiempo de setup.
- Auth propio: innecesariamente complejo para este alcance.

**Consecuencias:**
- El usuario de Clerk es la fuente de verdad del `Profesional` en la base de datos.
- El JWT de Clerk se usa para identificar al profesional en cada request a la API.

---

## ADR-004 — Duración de turnos: slots fijos en lugar de duración libre

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
El profesional define una duración de slot fija (ej. 20, 30, 45 minutos) en su configuración. Todos los turnos duran ese tiempo. No hay duración libre por turno.

**Por qué:**
Con duración libre, dos turnos pueden pisarse si el profesional no calcula bien los tiempos. Validar solapamientos es lógica extra y fuente de bugs. Con slots fijos el problema desaparece: si un slot está tomado, directamente no aparece como opción.

**Alternativas descartadas:**
- Duración libre con validación de solapamiento: más flexible pero más compleja, más propensa a errores de usuario.

**Consecuencias:**
- Se necesita una entidad `ConfiguracionProfesional` en el schema desde el inicio.
- Los slots se generan dinámicamente en runtime a partir de la configuración — no se persisten slots vacíos en la base de datos.
- Al crear un turno, el formulario muestra solo los slots libres para esa fecha, no un input de hora libre.

---

## ADR-005 — Feriados: pre-cargados en base de datos

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Los feriados argentinos se cargan una sola vez desde la API pública y se guardan en una tabla `Feriado` en la base de datos. El calendario y el chat los leen desde ahí, nunca desde la API externa en runtime.

**Por qué:**
Consultar la API de feriados en cada render del calendario o en cada mensaje del chat genera requests innecesarios, agrega latencia y es un punto de falla externo. Los feriados no cambian una vez publicados.

**Alternativas descartadas:**
- Consultar la API en cada request: innecesario, lento, costoso en llamadas.
- Hardcodear los feriados en el código: requiere actualizar el código cada año.

**Consecuencias:**
- La tabla `Feriado` es la única fuente de verdad para feriados en toda la app.
- Se necesita un mecanismo para actualizar los feriados al cambiar de año (botón manual en configuración del profesional).
- La carga inicial se hace una sola vez durante el setup o cuando la tabla está vacía.

---

## ADR-006 — Soft delete en pacientes

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Los pacientes nunca se eliminan físicamente de la base de datos. Se usa un campo `activo: boolean` para desactivarlos (soft delete).

**Por qué:**
Un paciente puede tener turnos históricos. Eliminarlo físicamente rompería la integridad referencial y se perdería el historial. Desactivarlo mantiene los datos intactos y permite reactivarlo si es necesario.

**Alternativas descartadas:**
- Eliminación física con cascada: destruye el historial de turnos, inaceptable en un sistema de salud.
- Eliminación física solo si no tiene turnos: lógica extra, experiencia confusa para el profesional.

**Consecuencias:**
- El listado de pacientes filtra por `activo: true` por defecto.
- Los turnos históricos de un paciente desactivado se conservan y son consultables.

---

## ADR-007 — Flujo de creación de turno cuando el paciente no existe

**Fecha:** Pre-desarrollo
**Estado:** Aceptada

**Decisión:**
Si al crear un turno el paciente no existe, el profesional es redirigido al formulario de creación de paciente. Al volver, debe clickear el slot de nuevo y seleccionar al paciente recién creado manualmente.

**Por qué:**
Persistir el estado del modal entre navegaciones (fecha, slot seleccionado) agrega complejidad innecesaria para un caso que ocurre poco. La simplicidad de implementación tiene más valor que el ahorro de un click.

**Alternativas descartadas:**
- Opción A (recordar el estado del modal al volver): mejor UX pero más código, más estado que mantener, más superficie de bugs.
- Crear el paciente dentro del mismo modal: formulario dentro de modal se vuelve complejo y la UX empeora.

**Consecuencias:**
- El profesional hace dos pasos en lugar de uno cuando el paciente no existe.
- El Combobox de selección de paciente tiene al final un ítem fijo "＋ Crear nuevo paciente" que redirige al formulario.

---

## ADR-008 — Historial del chat: límite de mensajes enviados al LLM

**Fecha:** Pendiente de definir durante Feature 6
**Estado:** Pendiente

**Decisión:**
_Definir cuántos mensajes anteriores se envían en cada request a Groq para mantener contexto sin inflar el consumo de tokens._

**Opciones a evaluar:**
- Últimos 10 mensajes (5 turnos de conversación)
- Últimos 6 mensajes (3 turnos)
- Sin historial (cada mensaje es independiente)

**Notas:**
Para las tools simples de este sistema (buscar turnos, consultar disponibilidad) el historial probablemente no sea crítico. Evaluar en Feature 6 qué tan necesario es el contexto previo para las respuestas.

---

## 📝 Plantilla para nuevas entradas

```
## ADR-XXX — Título corto de la decisión

**Fecha:** 
**Estado:** Aceptada / Pendiente / Reemplazada por ADR-XXX

**Decisión:**
Qué se decidió hacer.

**Por qué:**
Razones que justifican la decisión.

**Alternativas descartadas:**
- Opción X: por qué no.

**Consecuencias:**
Qué implica esta decisión hacia adelante.
```