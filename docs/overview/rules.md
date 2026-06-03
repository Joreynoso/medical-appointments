# 📜 Reglas del Agente (rules.md)

Este documento contiene las reglas de desarrollo fundamentales y obligatorias que todo agente de IA debe leer, comprender y seguir estrictamente antes de realizar cualquier cambio en el repositorio.

---

## 🚨 Reglas de Oro (Golden Rules)

### 1. 🔍 Leer este archivo primero (Read First)
Antes de analizar la base de datos, escribir código, modificar archivos o planificar tareas, el agente **siempre** debe leer por completo este archivo (`rules.md`) para alinear su comportamiento con los estándares del proyecto.

### 2. 🧩 Una sola implementación a la vez (One Thing at a Time)
*   **Enfoque único**: Realiza y ejecuta **una sola** implementación, corrección o mejora a la vez.
*   **Evita la dispersión**: No mezcles múltiples tareas independientes o cambios masivos paralelos en un mismo turno. Resuelve un problema, verifícalo, y solo después avanza al siguiente.

### 3. 🎯 Definición de Listo / Terminado al 100% (Definition of Done)
Una tarea (funcionalidad requerida, mejora, cambio, corrección de bug, optimización de rendimiento o solución de seguridad/vulnerabilidad) se considera completa **únicamente** cuando se cumplen las siguientes condiciones:
*   **Funcionalidad Completa**: El cambio requerido está 100% implementado y cubre todos los casos de uso esperados.
*   **Estabilidad del Proyecto**: El proyecto funciona correctamente.
*   **Sin Errores de Compilación**: El proyecto compila por completo sin errores de TypeScript, linters o en la consola del servidor de desarrollo.
*   **Sin Errores en la Vista (UI)**: El frontend renderiza y funciona de forma fluida sin excepciones de React ni pantallas en blanco.

### 4. 📚 Mantener AGENTS.md Sincronizado (Keep the Portal Updated)
Cada vez que se cree un **nuevo documento** en `/docs` o se **modifique el nombre o propósito** de uno existente, el agente **debe** evaluar si ese cambio debe reflejarse en `AGENTS.md`:

*   **Actualizar AGENTS.md**: Cuando el documento nuevo o modificado es de consulta general para el agente (ej. un nuevo módulo documentado, un nuevo reporte de mejoras, un nuevo área del sistema).
*   **No es necesario actualizar AGENTS.md**: Cuando el cambio es un ajuste menor de contenido interno de un documento ya listado (ej. se corrige un párrafo, se añade un ejemplo dentro de `schema.md`), o es un archivo temporal/scratch que no aporta contexto al agente.

> **Criterio clave**: Si un agente que lea `AGENTS.md` quedaría desinformado sobre un recurso relevante por no estar listado ahí, entonces **sí** se debe actualizar.
