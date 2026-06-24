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

## ADR-017 — Modal global de creación de turno via React Context

**Fecha:** 2026-06-10
**Estado:** Aceptada

**Decisión:**
Se implementó el modal de creación de turno (`CrearTurnoModal`) como un componente global renderizado a nivel del layout del dashboard, accesible desde el botón "Nuevo turno" del `Topbar` (presente en todas las vistas). La comunicación entre el `Topbar` y el modal se realiza mediante un contexto React (`CrearTurnoContext`) que expone:
- `openCrearTurno()` — abre el modal desde cualquier componente hijo
- `setPacientes()` — configura la lista de pacientes para el selector
- `setRefreshRange()` / `setOnTurnosChange()` — permite a cada página (ej. agenda) recibir notificaciones cuando se crea un turno para refrescar su estado local

**Por qué:**
- El botón "Nuevo turno" ya existía en el `Topbar` y está visible en todas las páginas del dashboard. Tener que agregar un botón duplicado en cada vista iba en contra del diseño existente.
- El modal necesita datos (pacientes) y callbacks (refresh de turnos) que varían según la página activa. Usar un contexto evita prop drilling a través del layout y mantiene el modal desacoplado de cada página.
- Las referencias (`useRef`) para los callbacks evitan closures stale cuando el callback se actualiza por cambios en el estado local de la página activa.

**Alternativas descartadas:**
- Botón "Nuevo turno" duplicado en cada página: inconsistente con el diseño actual, el Topbar ya tiene el botón.
- Renderizar el modal dentro de cada página: duplica el componente y require manejar estado modal en cada página.
- Evento global / pub-sub: menos idiomático en React, más difícil de depurar y tipar.

**Consecuencias:**
- El modal de creación de turno es accesible desde cualquier página del dashboard sin código adicional.
- Cada página debe configurar el contexto con `setPacientes` y los callbacks de refresh para que el modal funcione correctamente.
- El modal usa referencias para los callbacks en lugar de estado, lo que evita re-renders del provider cuando cambian.

---

## ADR-018 — Reemplazo de inputs nativos de fecha/hora por Popover+Calendar y Select personalizado

**Fecha:** 2026-06-10
**Estado:** Aceptada

**Decisión:**
Reemplazar los `<input type="date">` y `<input type="time">` nativos del navegador en `CrearTurnoModal` por:
- **Fecha**: shadcn `Popover` (basado en `@base-ui/react/popover`) + `Calendar` (basado en `react-day-picker` v10) con formato localizado en español (`date-fns/locale/es`).
- **Hora**: `<select>` nativo de HTML con opciones generadas dinámicamente desde `ConfiguracionProfesional` (horarioDesde → horarioHasta, step = duracionSlot), estilizado 100% con Tailwind y `appearance-none`.

**Por qué:**
- Los inputs nativos `type="date"` y `type="time"` tienen shadow-DOM interno que los navegadores renderizan con sus propios colores (azul Chromium `#4FC7F7`). Los pseudo-elementos webkit (`::-webkit-datetime-edit-text`, etc.) logran un control parcial pero insuficiente — el color azul persiste en foco, selección y en los separadores internos.
- Con `Popover + Calendar` y `<select>` personalizado se tiene control total de estilos mediante Tailwind y variables CSS del tema (Catppuccin Mocha), sin dependencias adicionales problemáticas.
- El `<select>` de hora solo muestra los slots válidos del profesional, eliminando la necesidad de validación `min`/`max` client-side y la lógica de `horaMinima` (ceiling al próximo slot disponible cuando la fecha es hoy).

**Alternativas descartadas:**
- Seguir con inputs nativos añadiendo más pseudo-elementos webkit: ya se intentó con `::-webkit-datetime-edit-text`, `::-webkit-datetime-edit-month-field`, `::-webkit-datetime-edit-day-field`, `::-webkit-datetime-edit-year-field` en foco — el azul interno persiste.
- Tres `<select>` separados para día/mes/año: UX más tosca, requiere tabular 3 campos.
- Librería externa de datepicker: agrega dependencias innecesarias cuando shadcn ya ofrece la solución.

**Consecuencias:**
- Se instalaron `date-fns` y `react-day-picker` como dependencias directas (ya eran transitivas).
- Se agregaron componentes shadcn `popover` y `calendar` a `components/ui/`.
- Se corrigió `calendar.tsx`: `table` → `month_grid` (compatible con react-day-picker v10).
- Se eliminó el bloque `<style>` con webkit pseudo-elementos y las refs `fechaRef`/`horaRef`.
- `fecha` cambió de tipo `string` a `Date | undefined`.
- Se eliminó la entrada "Native date/time inputs — blue internal elements persist" de `manual-tasks.md`.

---

## ADR-019 — Configuración base por defecto + días laborables + horario dinámico en vistas

**Fecha:** 2026-06-11
**Estado:** Aceptada

**Decisión:**
1. **Config base auto-creada** al registrarse: cuando `getCurrentProfesional()` crea un nuevo `Profesional`, también crea `ConfiguracionProfesional` con defaults (`08:00–19:00`, 30 min, lun–sáb).
2. **Campo `diasLaborables`** agregado al schema como `Int[]` con `@default([1,2,3,4,5,6])`. Domingo (0) hard-bloqueado: no aparece en UI, no se permite en validación server-side, no se puede agregar nunca.
3. **Server Action `actualizarConfiguracion`** con validaciones:
   - `duracionSlot` 10–120 min
   - `horarioDesde < horarioHasta`
   - `diasLaborables` min 1 día, sin domingo
   - ADR-011: bloquea cambio de `duracionSlot` si hay turnos `PENDIENTE`/`CONFIRMADO` futuros
   - Bloquea cambio de rango horario si hay turnos fuera del nuevo rango
4. **Horario dinámico en WeekView**: reemplaza las constantes hardcodeadas `START_HOUR=7`/`END_HOUR=20` por props `horarioDesde`/`horarioHasta`. El grid semanal y las posiciones de turnos se calculan dinámicamente.
5. **Días no laborables en vistas**: `DayCard`, `WeekView` y `MonthView` reciben `diasLaborables` como prop y aplican `bg-muted` visual.

**Por qué:**
- Sin config base, la app no puede generar slots ni validar turnos desde el primer login. Forzar al médico a configurar antes de usar es mala UX.
- Los días laborables deben ser configurables (no todos atienden sábados), pero el domingo no es negociable como día no laborable.
- Las vistas del calendario deben mutar visualmente según la configuración para ser consistentes.

**Alternativas descartadas:**
- Mantener domingo configurable: el usuario lo pidió explícitamente como hard-bloqueado.
- Fetch de config en client-side (AgendaClient): mejor Server Component para evitar estado de carga.
- Tres selects separados para día/mes/año: UX inferior al Popover+Calendar ya implementado (ADR-018).

**Consecuencias:**
- `getCurrentProfesional()` ahora siempre retorna un profesional con `configuracion` poblada.
- `getConfiguracionHoraria()` ya no lanza error — siempre hay config.
- Se eliminó `isSunday()` de `calendar-utils.ts` como dependencia en las vistas (reemplazado por `diasLaborables.includes()`).
- `AgendaPage`, `AgendaClient`, `WeekView`, `MonthView`, `DayCard` ahora reciben `horarioDesde`, `horarioHasta`, `diasLaborables` como props.
- El Calendar popover del modal usa `config.diasLaborables` para deshabilitar días.
- Sección de configuración completa en `/dashboard/configuracion`.

---

## ADR-020 — Flujo de estados de turno: transiciones, visibilidad y slot libre

**Fecha:** 2026-06-15
**Estado:** Aceptada

**Decisión:**
Se implementa el flujo completo de estados del turno con las siguientes transiciones:
- `PENDIENTE` → `CONFIRMADO` / `CANCELADO`
- `CONFIRMADO` → `CANCELADO` / `AUSENTE`
- `CANCELADO` / `AUSENTE` → `CONFIRMADO` (reagendar)

Comportamiento por estado:
- **CANCELADO**: el turno se oculta del calendario (vistas semanal y mensual) y su slot se libera, apareciendo como disponible para nuevo turno.
- **AUSENTE**: el turno permanece visible en el calendario como registro de inasistencia (badge naranja), el slot NO se libera.
- **PENDIENTE / CONFIRMADO**: ocupan el slot, no aparece como libre en `CrearTurnoModal`.

La confirmación de cancelación es inline dentro del modal de detalle (botón "Cancelar turno" → se expanden botones "Sí, cancelar" / "No" dentro del mismo modal), reemplazando el enfoque anterior de AlertDialog anidado.

**Por qué:**
- El médico necesita poder cancelar y reagendar en el mismo slot sin perder el registro del turno original.
- Ocultar CANCELADO evita ruido visual en la agenda.
- Mantener AUSENTE visible permite al médico saber que el paciente no asistió.
- La confirmación inline evita la mala UX de un diálogo anidado sobre otro modal.

**Alternativas descartadas:**
- AlertDialog para confirmación de cancelación: UX pobre al tener dos modales superpuestos.
- Mostrar CANCELADO como ocupado: el médico no podría usar ese slot sin antes eliminar el turno.
- Ocultar AUSENTE: se pierde el registro de inasistencia, que es información clínica relevante.

**Consecuencias:**
- `getSlotsOcupadosEnFecha()` filtra solo estados `PENDIENTE` y `CONFIRMADO` para determinar slots libres.
- `getTurnosDelProfesionalEnRango()` retorna todos los turnos sin filtrar para el calendario, pero la vista filtra `CANCELADO` visualmente.
- Se eliminaron los turnos existentes en DB (todos estaban en PENDIENTE) para probar el flujo completo desde cero.
- El modal de detalle (`DetalleTurnoModal`) contiene la lógica de confirmación inline sin depender de componentes externos.

---

## ADR-022 — Exclusión de interacciones por click en calendario (MVP)

**Fecha:** 2026-06-18
**Estado:** Aceptada

**Decisión:**
Se eliminan del alcance del MVP las siguientes interacciones del calendario:
- Click en bloque libre → modal de creación con fecha y slot pre-cargados
- Click en día del calendario mensual → navegación a vista semanal

Ambas se trasladan a mejoras futuras.

**Por qué:**
Son funcionalidades de navegación/UX que agregan complejidad innecesaria (sobre-ingeniería) sin aportar valor real al núcleo del producto: la gestión de turnos ya funciona correctamente desde el botón "Nuevo turno" en la Topbar y las flechas de navegación semanal. Implementarlas requería lógica extra de coordinación entre componentes, manejo de estados y rutas, cuyo beneficio no justifica el esfuerzo en esta etapa.

**Alternativas descartadas:**
- Implementarlas: demasiado complejo para el valor que aportan.

**Consecuencias:**
- El MVP se simplifica, permitiendo enfocar esfuerzos en el chat con IA (Feature 6).
- Los 3 items quedan documentados en `project.features.md` (Won't Have) y `project.overview.md` (Mejoras futuras) para su eventual implementación post-MVP.

---

## ADR-021 — Modelo ObraSocial: ABM por profesional y relación con Paciente

**Fecha:** 2026-06-15
**Estado:** Aceptada

**Decisión:**
Se creó el modelo `ObraSocial` con FK a `Profesional` (per-profesional), soft delete (`activo`), y unique constraint `[profesionalId, nombre]`. Se agregó `obraSocialId` nullable a `Paciente` con FK `ON DELETE SET NULL` (al desactivar una obra social, los pacientes conservan su registro pero pierden la referencia). Se implementó ABM completo (página, Server Actions, componente cliente) replicando el patrón de Pacientes. Se pre-carga "Particular" por defecto en el seed.

**Por qué:**
- La obra social es conceptualmente del paciente, pero en un sistema multi-tenant sin admin global, el profesional necesita gestionar su propio catálogo de obras sociales (mismo patrón que Pacientes).
- El soft delete y `SET NULL` preservan la integridad del historial de pacientes.
- "Particular" pre-cargada evita que el profesional tenga que crearla manualmente en su primer uso.

**Alternativas descartadas:**
- ObraSocial global (sin FK a Profesional): requeriría admin global, no existe en el sistema.
- ObraSocial como string libre en Paciente (sin modelo separado): imposibilita el ABM y la consistencia.
- FK `ON DELETE RESTRICT` en Paciente: impediría desactivar obras sociales con pacientes asociados.

**Consecuencias:**
- Cada profesional tiene su propio catálogo de obras sociales.
- El formulario de Paciente ahora incluye un `<select>` de obra social.
- La tabla de pacientes muestra la obra social en desktop y mobile.
- Se agregó ruta `/dashboard/obras-sociales` con navegación en el sidebar.
- El seed crea "Particular" y la asigna a todos los pacientes de prueba.
- La migración agregó las tablas y columnas sin downtime (columna nullable, tabla nueva).

---

## ADR-023 — Chat IA como modal global en lugar de página independiente

**Fecha:** 2026-06-18
**Estado:** Aceptada

**Decisión:**
El chat con IA se implementa como un modal global accesible desde un botón en la Topbar (icono `Bot` con animación pulse), en lugar de una página independiente `/dashboard/chat`. El estado de la conversación persiste al abrir/cerrar el modal. La ruta `/dashboard/chat` redirige a `/dashboard`.

**Por qué:**
- El chat es una herramienta de consulta rápida que el profesional necesita tener accesible desde cualquier vista del dashboard sin perder contexto.
- Como página independiente, obligaba a navegar fuera de la vista actual (agenda, pacientes, etc.) para hacer una consulta.
- El modal permite consultar "al vuelo" mientras se trabaja en otra sección.
- El botón en la Topbar con icono y pulse destaca visualmente la funcionalidad sin ser intrusivo.
- Sigue el mismo patrón que `CrearTurnoModal` (modal global vía contexto React).

**Alternativas descartadas:**
- Página independiente `/dashboard/chat`: obliga a cambiar de contexto, menos práctico.
- Panel lateral fijo: consume espacio horizontal valioso en el dashboard.
- Widget flotante tipo Facebook Messenger: más complejo de implementar, menos integrado con el diseño existente.

**Consecuencias:**
- Se eliminó la navegación a `/dashboard/chat` del sidebar.
- El botón en la Topbar está visible en todas las páginas del dashboard.
- El estado de la conversación (mensajes) se preserva entre aperturas del modal porque `ChatShell` permanece montado en el árbol de React.
- La ruta `/dashboard/chat` existe como redirect para no romper bookmarks existentes.

## ADR-024 — Confirmación de acciones destructivas en el chat

**Fecha:** 2026-06-19
**Estado:** Aceptada

**Decisión:**
Las tools destructivas del chat (`crear_turno`, `cancelar_turno`) usan un flujo de dos fases: primero `validate` (solo lectura), luego `execute` (escritura). El frontend muestra botones Sí/No inline en el chat para que el profesional confirme antes de persistir.

**Por qué:**
- Evita que el LLM ejecute acciones no deseadas sin supervisión humana.
- El patrón de dos fases separa la validación (leer base, verificar disponibilidad) de la escritura.
- Los botones inline mantienen al usuario dentro del chat, sin modales externos ni navegación.
- El LLM formatea la confirmación con los datos relevantes (paciente, fecha, hora) antes de pedir el Sí/No.

**Alternativas descartadas:**
- Ejecutar directamente con confirmación solo en el prompt: inseguro, el LLM puede ignorar la instrucción.
- Soportar `undo` posterior: más complejo de implementar, requiere bitácora de cambios.
- Modales externos de confirmación: rompen el flujo del chat, sacan al usuario de contexto.

**Consecuencias:**
- Cada tool destructiva tiene dos métodos: `validate` (retorna `{ esValido, detalle }`) y `execute` (persiste).
- La API route distingue tools destructivas por nombre en `destructiveToolNames`; en primera llamada solo valida, en segunda (tras confirmación) ejecuta.
- El frontend mantiene estado `pendingConfirmation` con los argumentos de la tool; al rechazar, se limpia y se muestra mensaje de cancelación.
- Las tools de solo lectura (`buscar_turnos`, `consultar_disponibilidad`) siguen el flujo directo.

## ADR-026 — Consulta de feriados sin tool LLM (botón directo)

**Fecha:** 2026-06-22
**Estado:** Aceptada

**Decisión:**
No se implementó la tool LLM `consultar_feriados`. El botón directo "Consultar feriados" del ToolDropdown es la única vía de consulta — siempre muestra los feriados del año actual.

**Por qué:**
- ADR-001 ya establece que los botones de acceso directo deben disparar herramientas sin pasar por el modelo para reducir requests innecesarios al LLM.
- El botón "Consultar feriados" ya existía como acceso directo (server action directa a DB). Agregar una tool LLM duplicada sería redundante e iría contra la regla "No llamar al LLM si la acción puede resolverse directamente con datos".
- Los feriados son datos estáticos anuales que no requieren procesamiento de lenguaje natural para consultarlos.
- La validación de feriados al crear/cancelar turnos ya está cubierta en las tools `crear_turno.tool.ts` y `consultar_disponibilidad.tool.ts`, que verifican contra la tabla Feriado.
- Se evaluó agregar parámetros opcionales (año/mes) al botón, pero se descartó por simplicidad: el 90% de los casos se cubre con el año completo. El dropdown se mantiene sin inputs extra.

**Alternativas descartadas:**
- Crear `consultar_feriados.tool.ts` como tool LLM: redundante con el botón directo existente, duplica lógica y genera llamadas innecesarias a Groq.
- Parámetros año/mes en el botón directo: agregaba complejidad (diálogo previo o sub-items en dropdown) para poco beneficio.

**Consecuencias:**
- El botón siempre muestra feriados del año actual sin parámetros.
- Las fechas se formatean desde UTC (`toISOString()`) para evitar corrimiento por zona horaria del servidor.
- Feature 8 marcada como completada sin tool LLM.
- Se refuerza el patrón de acceso directo para consultas que no requieren LLM.

---

## ADR-025 — Onboarding tooltip con overlay y toolButton como referencia de posición

**Fecha:** 2026-06-19
**Estado:** Aceptada

**Decisión:**
El onboarding del chat se implementa como un tooltip flotante que:
- Se renderiza dentro del modal del chat como overlay `absolute inset-0` con `bg-black/40` (misma opacidad que el `Dialog.Backdrop` del modal, evitando efecto "doble modal").
- El tooltip card se posiciona justo encima del botón 🔧, con la flecha apuntando al centro del botón.
- El botón 🔧 se renderiza dentro del onboarding en la misma posición que en `ChatInput` (con un spacer invisible a la derecha simulando el botón de enviar), manteniendo el layout idéntico al real.
- "No volver a mostrar" es un botón secundario (no checkbox) que guarda `localStorage.setItem("chat_onboarding", "true")` y cierra.
- "Entendido" solo cierra sin guardar flag.

**Por qué:**
- El tooltip debe estar anclado al botón 🔧 para que el usuario entienda visualmente a qué se refiere.
- Renderizar el botón dentro del onboarding evita tener que coordinar dos árboles de React separados; la posición es exacta porque replica el layout de `ChatInput`.
- Usar la misma opacidad que el backdrop evita acumular capas de oscuridad.
- Botón "No volver a mostrar" es más simple que checkbox + botón "Entendido" — dos botones lado a lado, uno guarda flag, el otro no.
- Icono `Wrench` de lucide-react en el tooltip (mismo que el botón) refuerza la relación visual.

**Alternativas descartadas:**
- Checkbox + botón "Entendido": dos elementos de distinto tipo, más confuso visualmente.
- Overlay `bg-black/60`: sumado al `bg-black/40` del backdrop, generaba efecto "doble modal" demasiado oscuro.
- Overlay `bg-transparent`: no oscurecía el contenido del modal, se veía plano.
- Posicionar tooltip centrado con flecha centrada: la flecha no apuntaba al botón (que está a la derecha).
- Animar el tooltip con pulse: descartado por ser distractivo.

**Consecuencias:**
- El onboarding es autónomo: se renderiza como hijo del modal pero no depende de props de posicionamiento.
- El tooltip se mantiene responsive porque replica el layout del `ChatInput` (flex `justify-end` con spacer).
- No hay fugas de estado entre sesiones gracias a `localStorage`.
- Al no haber checkbox, se elimina el estado `dontShowAgain` del componente.

---

## ADR-027 — Búsqueda de pacientes con unaccent (acentos-insensitive)

**Fecha:** 2026-06-22
**Estado:** Aceptada

**Decisión:**
Se habilitó la extensión PostgreSQL `unaccent` en Neon y se creó el helper `lib/paciente-search.ts` con la función `buscarPacientesPorNombre()` que usa `$queryRaw` con `unaccent(nombre) ILIKE unaccent(search)` para búsqueda de pacientes que ignora tanto mayúsculas/minúsculas como acentos y diacríticos.

**Por qué:**
- Prisma `mode: "insensitive"` solo ignora mayúsculas, no acentos. "Jose" no matchea "José" en la DB.
- En un sistema de salud argentino, nombres con acentos son frecuentes (José, María, Juan José, etc.). El profesional escribe naturalmente sin acentos al dictar nombres al chat.
- La extensión `unaccent` es la solución correcta a nivel DB: eficiente, sin cambios en el schema, sin duplicar datos.

**Alternativas descartadas:**
- Normalización en JS con `normalize('NFD')`: menos eficiente, requiere traer todos los pacientes a memoria para filtrar.
- Campo `searchNombre` normalizado en el schema: requiere migración, duplica datos, más mantenimiento.

**Consecuencias:**
- Se creó `lib/paciente-search.ts` como helper centralizado.
- Se actualizaron 3 tools (5 queries en total): `crear_turno`, `cancelar_turno`, `buscar_turnos`.
- El helper es fácil de reutilizar en futuras búsquedas de pacientes.
- `CREATE EXTENSION IF NOT EXISTS unaccent` se ejecutó una vez en Neon.

---

## ADR-028 — FilterModal: tiempo real, single-select estado, sin "Hoy"

**Fecha:** 2026-06-24
**Estado:** Aceptada

**Decisión:**
Se implementó un modal de filtros (`FilterModal`) para la agenda con las siguientes características:
1. **Filtros en tiempo real**: cada cambio en el input de paciente o en las píldoras de estado se aplica inmediatamente al calendario (vistas semanal y mensual) — no hay botón "Aplicar".
2. **Estado single-select**: las píldoras de estado son radio-style (solo una activa a la vez), no multi-select. Click en la activa la desactiva (vuelve a "todos").
3. **Botón "Hoy" eliminado**: se reemplazó por un botón "Filtrar" con icono `Filter`. La fecha actual ya se muestra en el header de la página, haciendo redundante la navegación "Hoy".
4. **todayFlash eliminado**: la funcionalidad de destello visual al hacer "Hoy" se eliminó junto con el botón.
5. **Modal estilo CrearTurnoModal**: mismo patrón de `@base-ui/react` Dialog, mismo contenedor (`rounded-xl border border-border bg-card p-6 shadow-lg`), misma tipografía y espaciado.
6. **Turnos pasados filtrados**: en la lista de resultados del modal se excluyen turnos con fecha < today (en el calendario siguen visibles).
7. **"Limpiar filtros" inline**: resetea paciente y estado sin cerrar el modal, para que el profesional vea inmediatamente el resultado del reset.

**Por qué:**
- Sin botón "Aplicar": el profesional ve los resultados en el calendario al instante mientras ajusta los filtros. Un botón "Aplicar" agregaría fricción innecesaria.
- Single-select estado: el profesional solo necesita ver un estado a la vez (ej. "mostrar solo Pendientes"). Multi-select sería más complejo visualmente y no aporta valor real para este caso de uso.
- Eliminar "Hoy": el header ya muestra la fecha actual con formato localizado (`lunes 24 de junio de 2026`). El botón "Hoy" era redundante. Reemplazarlo por "Filtrar" da más utilidad al espacio en la toolbar.
- todayFlash: era una animación puramente decorativa sin valor funcional. Al eliminar "Hoy", se eliminó también.

**Alternativas descartadas:**
- Multi-select estado (checkboxes): más complejo visualmente, no hay caso de uso real donde el profesional necesite ver dos estados específicos a la vez.
- Botón "Aplicar" para confirmar filtros: agregaba un paso extra sin beneficio porque el filtrado es client-side e instantáneo.
- Mantener "Hoy" + "Filtrar" como botones separados: la toolbar se saturaba visualmente en mobile.
- Select nativo `<select>` para estado en lugar de píldoras: las píldoras son más rápidas de usar (un click), más visibles y permiten toggle.

**Consecuencias:**
- El `FilterState` usa `estado: null | "PENDIENTE" | "CONFIRMADO" | "AUSENTE"` en lugar de array.
- El `CalendarToolbar` ya no recibe `todayFlash` ni `handleToday`.
- `WeekView`, `MonthView`, `DayView`, `DayCard` ya no tienen prop `todayFlash`.
- El header de agenda ahora muestra `toLocaleDateString("es-AR", ...)`.
- Los filtros viven en `AgendaClient` como `useState<FilterState>` y se pasan a `CalendarToolbar` y `FilterModal`.
- El modal de filtros sincroniza estado local con los filtros aplicados al abrirse (`useEffect` en `open`).
- Se crearon 13 turnos seed para validar el comportamiento del filtro con datos variados.

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