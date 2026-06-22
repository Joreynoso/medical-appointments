# Guía Maestra — Documentación del Trabajo Final
## Desarrollo de Aplicaciones Web con Inteligencia Artificial

> **Cómo usar este archivo:** este documento es una **guía operativa para un agente de IA con acceso al repositorio**. El proyecto ya está construido y funcionando; lo que falta es la documentación que pide la cátedra. El agente debe avanzar **sección por sección, en orden**, y para cada una:
> 1. Inspeccionar el código/repo para extraer la evidencia real (no inventar nada).
> 2. Si algo no se puede deducir del código (ej. decisiones de diseño, prompts usados, motivación del proyecto), **preguntarle al usuario** antes de continuar.
> 3. Generar el contenido de esa sección en el archivo de salida correspondiente.
> 4. Marcar la sección como completada en el checklist antes de pasar a la siguiente.
>
> No avanzar a la siguiente sección sin cerrar la anterior. No asumir información que no está ni en el código ni confirmada por el usuario.

---

## Checklist general de avance

- [ ] 0. Escaneo inicial del repositorio
- [ ] 1. Definición del problema y usuarios
- [ ] 2. Interfaz web funcional
- [ ] 3. Lógica de negocio
- [ ] 4. Manejo de datos
- [ ] 5. Integración o automatización
- [ ] 6. Uso documentado de IA
- [ ] 7. Despliegue
- [ ] 8. README final
- [ ] 9. Memoria de desarrollo (1-3 páginas)
- [ ] 10. Preparación de la defensa/demo

Archivos de salida que este proceso debe producir:
- `README.md`
- `MEMORIA_DESARROLLO.md`
- `USO_DE_IA.md` (puede integrarse como sección del README o de la memoria si el usuario lo prefiere)

---

## Paso 0 — Escaneo inicial del repositorio

**Objetivo:** que el agente entienda la estructura real del proyecto antes de documentar nada.

El agente debe:
- Listar la estructura de carpetas y archivos principales.
- Identificar stack tecnológico (frontend, backend, base de datos, lenguajes, frameworks).
- Identificar el punto de entrada de la app y cómo se levanta localmente.
- Detectar archivos de configuración relevantes (`.env.example`, `package.json`, `requirements.txt`, `docker-compose.yml`, etc.).
- Detectar si ya existe algún `README` previo, `CHANGELOG`, o documentación parcial para no duplicar trabajo.

**Si algo no es evidente desde el código (ej. nombre del proyecto, propósito general), preguntar al usuario antes de continuar.**

Salida: un resumen breve en este mismo chat (no hace falta archivo) que sirva de contexto para los pasos siguientes.

---

## Paso 1 — Definición del problema y usuarios

**Evidencia esperada según el enunciado:** descripción breve del problema, destinatarios principales, contexto de uso y objetivo de la solución.

El agente debe:
- Revisar el código (textos de la UI, nombres de entidades, lógica de negocio) para inferir qué problema resuelve la app.
- Proponer un borrador de: problema, usuario destinatario, contexto de uso, objetivo.
- **Preguntar al usuario** para confirmar o corregir ese borrador (la motivación real y el contexto de uso casi nunca están en el código).

Preguntas sugeridas si hace falta:
- ¿Quién es el usuario real/imaginado de esta app?
- ¿Qué hacía esa persona antes de tener esta solución (proceso manual, otra herramienta, nada)?
- ¿Por qué elegiste este problema en particular?

Salida: sección "Definición del problema y usuarios" → va al **README** y resumida en la **Memoria**.

---

## Paso 2 — Interfaz web funcional

**Evidencia esperada:** pantallas navegables, diseño responsive básico, jerarquía visual clara, estados principales contemplados.

El agente debe:
- Recorrer las rutas/páginas/componentes de la UI y listar todas las pantallas existentes.
- Verificar si hay manejo de estados (carga, vacío, error, éxito) en al menos las pantallas principales.
- Verificar si hay media queries, breakpoints, o un framework CSS responsive (Tailwind, Bootstrap, CSS Grid/Flexbox adaptativo).
- Tomar o solicitar capturas de pantalla de las pantallas principales (si el agente puede ejecutar la app y capturar screenshots, hacerlo; si no, pedirle al usuario que las adjunte).

Salida: sección "Pantallas y diseño" con lista de pantallas + capturas → va al **README**.

---

## Paso 3 — Lógica de negocio

**Evidencia esperada:** reglas, cálculos, flujos, validaciones o procesos que hagan que la aplicación resuelva una tarea concreta.

El agente debe:
- Identificar en el código las reglas de negocio centrales (validaciones, cálculos, flujos condicionales, permisos, estados de un proceso).
- Listar 3-5 ejemplos concretos con referencia al archivo/función donde viven (ej. "Validación de stock antes de confirmar venta — `services/orders.ts:42`").
- Si hay reglas no evidentes en el código (ej. "por qué se decidió este límite o esta validación"), preguntar al usuario.

Salida: sección "Lógica de negocio y reglas implementadas" → va a la **Memoria de desarrollo** (es donde más peso tiene este criterio) y resumida en el **README**.

---

## Paso 4 — Manejo de datos

**Evidencia esperada:** datos locales, base de datos, almacenamiento en la nube, archivos, formularios persistentes o integración equivalente.

El agente debe:
- Identificar qué mecanismo de persistencia usa el proyecto (DB relacional, NoSQL, localStorage, archivos, servicio en la nube).
- Si hay base de datos: extraer o describir el modelo de datos (tablas/colecciones principales y relaciones).
- Verificar si hay migraciones, seeds, o esquemas (`schema.prisma`, `models.py`, `migrations/`, etc.).

Salida: sección "Modelo y manejo de datos" → va al **README** (con diagrama o lista de entidades si aplica).

---

## Paso 5 — Integración o automatización

**Evidencia esperada:** consumo de una API, conexión con un servicio externo, generación automática de contenido, notificaciones, reportes o flujo automatizado relevante.

El agente debe:
- Buscar en el código llamadas a APIs externas (claves de entorno tipo `_API_KEY`, imports de SDKs, llamadas `fetch`/`axios` a dominios externos).
- Identificar si hay automatizaciones (cron jobs, webhooks, triggers, generación automática de reportes/notificaciones).
- Documentar qué API/servicio se usa, para qué, y qué pasaría si no estuviera disponible (manejo de errores/fallback).

Salida: sección "Integraciones y automatización" → va al **README**.

---

## Paso 6 — Uso documentado de IA

**Evidencia esperada:** registro breve de cómo se utilizó la IA durante el desarrollo: prompts relevantes, decisiones tomadas, errores corregidos y límites encontrados.

⚠️ **Esta sección no se puede inferir del código.** El agente debe preguntar directamente al usuario, por ejemplo:
- ¿Qué herramientas de IA usaste durante el desarrollo (Claude, ChatGPT, Copilot, Cursor, v0, etc.)?
- ¿Para qué las usaste principalmente? (ideación, generación de código, debugging, diseño UI, documentación)
- ¿Hay 2-3 ejemplos concretos de un prompt que haya sido especialmente útil, y qué resultado dio?
- ¿Hubo algún error o respuesta de la IA que tuviste que corregir o descartar? ¿Cómo te diste cuenta?
- ¿Qué cosas decidiste vos con criterio propio, en lugar de aceptar lo que sugería la IA?
- ¿Qué limitaciones le encontraste a la IA en este proyecto?

Si el usuario tiene historial de chats/prompts guardados, el agente puede ayudar a resumirlos en vez de hacer que los retipee todos.

Salida: sección "Uso de IA en el desarrollo" → va al **README** (resumen) y desarrollada en la **Memoria** (es un criterio de evaluación con puntaje propio, 15 pts).

---

## Paso 7 — Despliegue

**Evidencia esperada:** publicación en una plataforma accesible o demostración equivalente.

El agente debe:
- Confirmar con el usuario si la app ya está desplegada y en qué plataforma (Vercel, Netlify, Render, Railway, etc.).
- Pedir el enlace público.
- Verificar (si tiene acceso a internet) que el enlace responde correctamente.
- Si no está desplegada, documentar instrucciones claras de instalación y ejecución local como alternativa.

Salida: sección "Despliegue / Cómo ejecutar el proyecto" → va al **README** (sección obligatoria y muy visible, cerca del inicio).

---

## Paso 8 — Armado del README final

Con todo lo recolectado en los pasos 1-7, el agente debe ensamblar `README.md` con esta estructura sugerida:

```markdown
# Nombre del Proyecto

Descripción breve (1-2 líneas).

## Problema y usuarios
...

## Demo / Despliegue
Enlace: ...
Cómo correrlo localmente: ...

## Funcionalidades principales
...

## Capturas de pantalla
...

## Tecnologías utilizadas
...

## Modelo de datos
...

## Integraciones y automatización
...

## Uso de IA en el desarrollo
(resumen breve, con link a MEMORIA_DESARROLLO.md para el detalle)

## Instalación
...

## Autor(es)
...
```

---

## Paso 9 — Memoria de desarrollo (1 a 3 páginas)

El agente debe redactar `MEMORIA_DESARROLLO.md` cubriendo, en prosa breve y concreta (no bullet-only):

1. **El problema** que resuelve la app y por qué se eligió.
2. **La solución**: qué hace la app, alcance final vs. alcance ideal.
3. **Decisiones principales**: 3-5 decisiones técnicas o de producto relevantes, con su justificación.
4. **Uso de IA**: ampliando lo del Paso 6, con foco en criterio propio aplicado.
5. **Limitaciones actuales** del producto.
6. **Mejoras futuras** (qué quedaría para una v2).

Extensión objetivo: 1 a 3 páginas (no más). El agente debe priorizar densidad de información sobre extensión.

---

## Paso 10 — Preparación de la defensa

El agente debe ayudar al usuario a armar un guion breve de demo, cubriendo:
- Problema en 1 frase.
- Demo del flujo principal (sin trabarse).
- 2-3 decisiones de diseño/técnicas que pueda explicar si le preguntan.
- 1-2 limitaciones que pueda reconocer con seguridad si le preguntan.

Esto puede quedar como una sección final dentro de `MEMORIA_DESARROLLO.md` o como notas sueltas, según prefiera el usuario.

---

## Mapa rápido: requisito del enunciado → dónde se documenta

| Requisito del enunciado | Paso de esta guía | Archivo de salida |
|---|---|---|
| Definición del problema y usuarios | Paso 1 | README |
| Interfaz web funcional | Paso 2 | README |
| Lógica de negocio | Paso 3 | Memoria + README |
| Manejo de datos | Paso 4 | README |
| Integración o automatización | Paso 5 | README |
| Uso documentado de IA | Paso 6 | README + Memoria |
| Despliegue | Paso 7 | README |
| README completo | Paso 8 | README |
| Memoria de desarrollo | Paso 9 | Memoria |
| Defensa/demo | Paso 10 | Memoria (notas finales) |

---

## Reglas para el agente durante todo el proceso

- No avanzar de paso sin haber completado el anterior.
- No inventar funcionalidades, integraciones o decisiones que no estén en el código ni confirmadas por el usuario.
- Cuando haya ambigüedad entre lo que muestra el código y lo que dice el usuario, priorizar lo que muestra el código y señalar la discrepancia.
- Mantener el tono de la documentación profesional pero simple, sin relleno.
- Al cerrar cada paso, marcar el checklist correspondiente en este mismo archivo.