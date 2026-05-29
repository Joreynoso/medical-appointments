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

## ADR-005 — Feriados: pre-cargados en base de datos y sincronizados automáticamente

**Fecha:** 2026-05-29
**Estado:** Aceptada

**Decisión:**
Los feriados nacionales se cargan en la base de datos en la tabla `Feriado` con una restricción de unicidad (`@unique`) en la fecha. La sincronización se realiza de forma automática en el arranque/iniciación de la aplicación (lazy loading) si no se detectan feriados cargados para el año en curso, eliminando botones de sincronización manual en la UI de configuración.

**Por qué:**
Consultar la API de feriados en cada render del calendario o en cada mensaje del chat genera latencia y fallos externos. Almacenarlos en DB con clave única previene duplicidades accidentales y la sincronización automática elimina la necesidad de que el usuario gestione bases de datos manualmente.

**Alternativas descartadas:**
- Botón manual de sincronización: expone detalles técnicos al usuario y puede generar race conditions en entornos concurrentes.
- API en runtime: lenta e ineficiente.

**Consecuencias:**
- La tabla `Feriado` es la única fuente de verdad.
- No se expone un botón técnico de base de datos en la UI.
- Se previene la duplicidad mediante el índice único de Prisma.

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

## ADR-007 — Flujo de creación de turno cuando el paciente no existe (Modal rápido)

**Fecha:** 2026-05-29
**Estado:** Aceptada (Reemplaza la decisión de redirección previa)

**Decisión:**
Si al crear un turno el paciente buscado no existe, el profesional puede dar de alta al paciente de forma rápida mediante un sub-diálogo/modal secundario en la misma pantalla. Este formulario invoca una Server Action que registra al paciente y lo selecciona inmediatamente en el selector de turnos, sin perder el slot previamente cliqueado.

**Por qué:**
Redirigir a otra pantalla rompía el flujo de trabajo del profesional y obligaba a recordar estados o re-seleccionar el slot. El sub-modal ofrece una UX fluida y directa. Al utilizar Server Actions y estados reactivos locales en Next.js, su implementación es más limpia que mantener parámetros en la URL entre distintas páginas.

**Alternativas descartadas:**
- Redirección de página completa: mala UX, obliga a manejar parámetros de retorno.

**Consecuencias:**
- UX fluida y sin interrupciones.
- Se mantiene el estado del modal del calendario.

---

## ADR-008 — Historial del chat: límite de mensajes enviados al LLM

**Fecha:** 2026-05-29
**Estado:** Aceptada

**Decisión:**
Para mantener el contexto en el chat de IA sin incurrir en costes excesivos o problemas de rendimiento, el historial de conversación enviado a la API de Groq en cada request estará limitado a los últimos 6 mensajes (es decir, 3 turnos completos de pregunta/respuesta).

**Por qué:**
La mayoría de las consultas operacionales (ej: "¿qué turnos tengo mañana?", "¿quién viene a las 10?") son autocontenidas o requieren un seguimiento muy corto ("¿y el viernes?"). Un historial de 6 mensajes es suficiente para resolver pronombres y referencias temporales directas sin inflar innecesariamente el número de tokens.

**Alternativas descartadas:**
- Sin historial (0 mensajes): imposibilita preguntas de seguimiento naturales.
- 10 o más mensajes: consumo innecesario de tokens en un MVP.

**Consecuencias:**
- Se conserva un contexto conversacional ágil.
- Consumo óptimo de tokens de entrada a Groq.

---

## ADR-009 — Sincronización de Clerk sin Webhooks (getCurrentProfesional Helper)

**Fecha:** 2026-05-29
**Estado:** Aceptada

**Decisión:**
El registro y la sincronización de los datos del `Profesional` autenticado con Clerk en la base de datos se realiza bajo demanda (Lazy initialization). Se usará una función auxiliar en el backend (`getCurrentProfesional`) que verifique la sesión de Clerk; si el usuario no existe en la base de datos local, lo crea en ese instante antes de proceder con cualquier consulta.

**Por qué:**
Los webhooks de Clerk requieren configurar URLs públicas expuestas (usando herramientas como ngrok en desarrollo local), lo cual añade fricción al entorno local, complejidad de configuración de seguridad, y posibles fallos si Clerk no logra contactar al backend. El helper bajo demanda es simple, seguro y funciona localmente sin internet entrante.

**Alternativas descartadas:**
- Webhooks de Clerk: complejos de configurar y testear localmente en entornos de desarrollo.

**Consecuencias:**
- Desarrollo local simple e independiente de túneles externos.
- La primera carga del dashboard realiza la inserción en la base de datos automáticamente si es un usuario nuevo.

---

## ADR-010 — Visibilidad de Domingos en el Calendario

**Fecha:** 2026-05-29
**Estado:** Aceptada

**Decisión:**
Los domingos se visualizarán en todas las vistas de calendario (mensual y semanal) para asegurar una cuadrícula simétrica y profesional, pero la interacción sobre ellos estará completamente deshabilitada. Los slots correspondientes no serán seleccionables ni cliqueables para reservar turnos.

**Por qué:**
Ocultar los domingos deforma el layout tradicional del calendario y empeora la UX visual. Mostrarlos como días bloqueados (estilos deshabilitados) mantiene la estructura familiar del calendario mensual/semanal a la vez que restringe la creación de turnos.

**Alternativas descartadas:**
- Ocultar la columna de domingo completamente: rompe la simetría y familiaridad del calendario.

**Consecuencias:**
- UI de calendario tradicional limpia y consistente.
- Bloqueo robusto a nivel de frontend de acciones sobre días no laborables.

---

## ADR-011 — Restricción de cambio de duración de slot

**Fecha:** 2026-05-29
**Estado:** Aceptada

**Decisión:**
Se restringirá la modificación del campo `duracionSlot` en `ConfiguracionProfesional` si el profesional tiene turnos programados a futuro con estado `PENDIENTE` o `CONFIRMADO`.

**Por qué:**
Dado que los slots se generan dinámicamente en runtime y la hora de fin de los turnos ya agendados está fijada con la configuración anterior, cambiar la duración del slot a futuro generaría una cuadrícula incompatible, lo que provocaría que turnos existentes se solaparan con la nueva estructura de slots. Exigir que no haya turnos pendientes futuros garantiza la integridad de la agenda.

**Alternativas descartadas:**
- Permitir libre cambio: genera solapamientos complejos y rompe la lógica de "slots libres automáticos".

**Consecuencias:**
- Se añade una validación en la acción de actualización de configuración.
- El usuario recibe un mensaje de error claro solicitando resolver o cancelar turnos futuros antes de cambiar la duración base.

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