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

## ADR-012 — Implementación de sincronización de feriados: lógica separada del `'use server'`

**Fecha:** 2026-06-04
**Estado:** Aceptada

**Decisión:**
La sincronización de feriados se implementó con dos capas separadas:
1. **`lib/feriados.ts`** — lógica pura (sin `'use server'`): `sincronizarSiEsNecesario()` verifica si hay feriados del año actual y, si no, hace fetch a `https://api.argentinadatos.com/v1/feriados/{año}` y hace `upsert` de cada registro.
2. **`lib/actions/feriados.ts`** — wrapper con `'use server'` que re-exporta la función para uso desde Client Components en el futuro.

El auto-sync se dispara desde el layout del dashboard (`app/dashboard/layout.tsx`), que es un Server Component, importando directamente `sincronizarSiEsNecesario()` desde `lib/feriados.ts`.

**Por qué:**
- Server Components no necesitan el overhead de una Server Action para llamar lógica server-side — pueden importar funciones normales directamente.
- Separar la lógica core del `'use server'` evita crear endpoints POST innecesarios cuando la función se usa solo desde Server Components, y mantiene la acción disponible por si en el futuro se necesita invocar desde un Client Component.
- El layout del dashboard es el punto de entrada natural para lazy loading: si el profesional nunca carga el dashboard, no tiene sentido sincronizar feriados.

**Alternativas descartadas:**
- Toda la lógica dentro del `'use server'`: innecesario para Server Components, crea una ruta POST que nadie usa.
- Toda la lógica en el layout: mezcla responsabilidades, difícil de reutilizar desde un Client Component.
- Seed script independiente: requeriría ejecución manual, contradice el auto-sync del ADR-005.

**Consecuencias:**
- `lib/feriados.ts` puede ser importado directamente desde Server Components sin generar endpoints POST.
- `lib/actions/feriados.ts` está listo para ser usado desde Client Components (chat, botones directos en el futuro).
- La API externa solo se llama una vez por año gracias al pre-check con `count()` y al `upsert` por fecha única.
- El auto-sync es transparente para el usuario — sin botones, sin UI, sin pantallas de carga.

---

## ADR-013 — Seed de datos de prueba con tsx + prisma.config.ts

**Fecha:** 2026-06-05
**Estado:** Aceptada

**Decisión:**
Se creó `prisma/seed.ts` con datos de prueba (1 profesional, 6 pacientes, 10 turnos) y `prisma.config.ts` para configurar el seed command. Se eliminó la clave `prisma` de `package.json`.

**Por qué:**
- `prisma/seed.ts` permite desarrollar y testear contra datos reales sin depender de la API de feriados o de datos manuales.
- `prisma.config.ts` es el formato recomendado por Prisma (la clave en `package.json` está deprecada desde Prisma 6 y se eliminará en Prisma 7).
- `tsx` permite ejecutar TypeScript directamente sin compilación previa.

**Alternativas descartadas:**
- Mantener `package.json#prisma.seed`: funciona en Prisma 6 pero emite warning de deprecación.
- Usar `node` con JS plano: requiere mantener dos versiones del seed.
- No crear seed: obliga a cargar datos manualmente en cada reset de base.

**Consecuencias:**
- `npx prisma db seed` (o el reset automático de `prisma migrate dev`) carga los datos de prueba.
- El seed es idempotente: si ya hay datos, se salta.
- `tsx` queda como devDependency del proyecto.
- El profesional de prueba usa `clerkId: "user_2dev_placeholder"` que debe reemplazarse por un Clerk ID real para desarrollo.

---

## ADR-014 — getCurrentProfesional helper (Clerk lazy init)

**Fecha:** 2026-06-05
**Estado:** Aceptada

**Decisión:**
Se implementó `lib/profesional.ts` con la función `getCurrentProfesional()` que:
1. Obtiene el `userId` de Clerk via `auth()`.
2. Busca el `Profesional` en la DB por `clerkId`.
3. Si no existe, crea el registro usando datos de la API de Clerk (nombre, email).

**Por qué:**
- ADR-009 ya definía esta estrategia pero nunca se implementó.
- Es el punto de entrada para todas las consultas que necesitan identificar al profesional autenticado.
- Evita webhooks de Clerk, manteniendo el desarrollo local simple.

**Alternativas descartadas:**
- Pasar `clerkId` desde el Server Component y buscar en DB: duplica lógica en cada página.
- Webhooks de Clerk: complejidad innecesaria en desarrollo (ADR-009).

**Consecuencias:**
- Cualquier Server Action o Server Component puede importar `getCurrentProfesional()` para obtener el profesional autenticado.
- El helper es lazy: solo crea el registro si es la primera vez que ingresa.
- Se usa `CLERK_SECRET_KEY` desde `.env.local` para llamar a la API de Clerk.

## ADR-015 — Unificación de la carga de páginas en el dashboard

**Fecha:** 2026-06-08
**Estado:** Aceptada

**Decisión:**
Unificar el comportamiento de la pantalla de carga (loading states) de las rutas del dashboard (`/pacientes` y `/agenda`) bajo la convención nativa de Next.js mediante archivos `loading.tsx` a nivel de ruta. Se reemplazó la carga parcial con `<Suspense>` interno dentro de `agenda/page.tsx` por un Server Component asíncrono puro que delega el estado de carga al manejador de Next.js, mostrando el mismo mensaje unificado ("Cargando datos...") y diseño centrado en el viewport.

**Por qué:**
- Mantener consistencia visual y de comportamiento en la transición entre las secciones del dashboard.
- Reducir la duplicidad de componentes de carga específicos (como "Cargando agenda..." y "Cargando pacientes...") en favor de un diseño genérico y consistente.
- Simplificar el código de los Server Components eliminando wrappers `<Suspense>` innecesarios cuando el comportamiento deseado de carga es a nivel de página completa.

**Alternativas descartadas:**
- Carga interna por sección con `<Suspense>` (mantener header fijo): se descartó para evitar la inconsistencia con `/pacientes` y otras páginas secundarias que ya utilizan la transición de página completa, y para evitar el boilerplate de extraer el contenido en componentes hijo sólo con propósitos de Suspense.

**Consecuencias:**
- La navegación hacia `/agenda` y `/pacientes` muestra la pantalla de carga nativa de Next.js (`loading.tsx`) con un layout consistente centrado.
- Ambos archivos `loading.tsx` tienen una implementación idéntica.

---

## ADR-016 — Rediseño del Footer (Tema Invertido y 500px)

**Fecha:** 2026-06-09
**Estado:** Aceptada

**Decisión:**
Reformular el diseño del footer para que use colores invertidos de forma automática en función del tema actual del sitio (tema oscuro cuando el sitio está en claro, y tema claro cuando el sitio está en oscuro) a través de redefiniciones de variables CSS de `app/globals.css` en la clase `.inverted-footer`. Además, ampliar la altura a un mínimo de 500px, adaptando un diseño multi-columna moderno y responsive.

**Por qué:**
- La inversión de colores en el footer resalta la separación visual de la landing page y le otorga un aire de diseño de alta gama y editorial.
- Un footer de 500px de altura ofrece espacio para una estructura informativa rica (enlaces, redes sociales, marca) en lugar de un área vacía, mejorando la estética general.
- Utilizar variables CSS heredadas en la clase `.inverted-footer` permite que todos los componentes hijos adopten los colores correctos de manera nativa sin duplicar clases condicionales de React o hooks del cliente.

**Alternativas descartadas:**
- Footer de 500px vacío de contenido: mala estética y desperdicio de espacio en pantalla.
- Clases condicionales de React basadas en JS para inversión de colores: requiere forzar un Client Component o pasar el estado del tema por props, lo que rompe el flujo estático limpio.

**Consecuencias:**
- El componente `Footer` hereda las propiedades invertidas a través de la clase `.inverted-footer`.
- La landing page cuenta con un pie de página de proporciones profesionales y diseño premium en todas las resoluciones.

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