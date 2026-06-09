# 🐛 Issue Log — medical-appointments

> Registro de errores, efectos secundarios y decisiones correctivas durante el desarrollo.

---

## ISSUE-001 — shadcn init sobrescribe globals.css y pierde tema personalizado

**Fecha:** 2026-05-29
**Feature:** Feature 1 — Setup del proyecto
**Tarea:** Inicializar shadcn/ui con configuración default

### Problema
Al ejecutar `npx shadcn@latest init --defaults`, el comando sobrescribe `app/globals.css` reemplazando todas las variables de color del tema Catppuccin personalizado (Latte para light mode, Mocha para dark mode) por los valores default neutrales de shadcn (blanco/gris/negro).

### Lo que se perdió
- `:root` pasó de tener colores Catppuccin Latte (`--background: #eff1f5`, `--primary: #8839ef`, etc.) a valores neutrales (`--background: oklch(1 0 0)`)
- `.dark` pasó de tener colores Catppuccin Mocha (`--background: #181825`, `--primary: #cba6f7`, etc.) a valores neutrales
- El resto de las variables de la paleta original (acento, muted, border, etc.) fueron reemplazadas

### Lo que shadcn agregó correctamente
- `@import "tw-animate-css"`
- `@import "shadcn/tailwind.css"`
- Variables extras en `@theme inline` como `--font-heading`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`
- Regla `html { @apply font-sans; }` en `@layer base`

### Causa raíz
`shadcn init` no tiene un modo "merge" o "preserve". Siempre regenera el archivo CSS con sus valores default. Es responsabilidad del desarrollador tener un backup o saber qué valores restaurar después del init.

### Lección aprendida
**Siempre hacer backup de `globals.css` antes de ejecutar `shadcn init`.** Alternativamente, ejecutar el init en un proyecto limpio y solo copiar los archivos de componentes (`components/ui/` y `lib/utils.ts`) sin dejar que sobrescriba el CSS.

---
