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

## ISSUE-002 — Clerk UserButton: texto e iconos del dropdown con mal contraste en tema oscuro

**Fecha:** 2026-06-28
**Feature:** Feature 1 — Setup del proyecto (Clerk)
**Tarea:** Configurar idioma español en Clerk

### Problema
Los botones de acción del dropdown del `UserButton` ("Administrar cuenta" y "Cerrar sesión") mostraban el texto y los iconos con un color de muy bajo contraste sobre el fondo oscuro del popover, haciéndolos difíciles de leer.

### Causa raíz
Clerk aplica colores por defecto a los elementos del dropdown (`userButtonPopoverActionButton` y `userButtonPopoverActionButtonIcon`) que no respetan las variables CSS del tema personalizado. Aunque `colorForeground` estaba mapeado a `var(--foreground)` en las `variables` globales de apariencia, Clerk no propaga ese color a estos elementos específicos del UserButton.

### Solución
Se agregaron dos reglas en `lib/clerk-appearance.ts` dentro del objeto `elements`:

```ts
userButtonPopoverActionButton: {
  color: "var(--foreground)",
},
userButtonPopoverActionButtonIcon: {
  color: "var(--foreground)",
},
```

- `userButtonPopoverActionButton` → color del texto de cada acción
- `userButtonPopoverActionButtonIcon` → color del icono de cada acción

Ambos apuntan a `var(--foreground)` (#c3c0b6), el color principal de párrafo del tema oscuro del proyecto.

### Lección aprendida
Los elementos del dropdown del UserButton de Clerk requieren estilizado explícito vía `elements` y no heredan automáticamente las `variables` globales de color de texto. Siempre que se personalice la apariencia de Clerk, verificar el dropdown del UserButton por separado.

---

## ISSUE-003 — Clerk clock skew: JWT iat en el futuro, login no redirige al dashboard

**Fecha:** 2026-06-29
**Feature:** Feature 1 — Setup del proyecto (Clerk) + Feature 8 (Profesional upsert fix)
**Tarea:** Login con Clerk + sincronización de profesional en DB

### Problema
Tras iniciar sesión con Clerk, el usuario quedaba atascado en `/sign-in?redirect_url=...` sin ser redirigido al dashboard. Sin embargo, navegando manualmente a `/dashboard` la app funcionaba correctamente.

### Causa raíz
El reloj del sistema de desarrollo estaba ~10s atrasado respecto al servidor de Clerk. El JWT emitido por Clerk contenía un `iat` (issued at) en el futuro desde la perspectiva local, lo que causaba que la validación del token fallara en el middleware (`proxy.ts`) con el error:

```
JWT issued at date claim (iat) is in the future.
(reason=token-iat-in-the-future, token-carrier=cookie)
Clerk: Clock skew detected.
```

Aunque Clerk intenta compensar clock skew en modo desarrollo (con un default de 5000ms), 10s excede ese margen.

### Checklist de intentos fallidos
- `forceRedirectUrl="/dashboard"` en `<SignIn>`: no resuelve porque el token no se valida, no es un problema de ruta de redirect.
- `afterSignInUrl` / `fallbackRedirectUrl`: los props `afterSignIn*` no existen en esta versión de Clerk SDK; los equivalentes correctos son `forceRedirectUrl` y `fallbackRedirectUrl`, pero ninguno funciona cuando la validación del JWT falla en el middleware.
- Client Component con `useAuth()` + `window.location.href`: tampoco activa el redirect si el SDK cliente no puede verificar el token por clock skew.

### Solución aplicada

**1. `proxy.ts` — Aumentar tolerancia de clock skew:**
```ts
export const proxy = clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) await auth.protect()
  },
  { clockSkewInMs: 30_000 },
)
```
Se subió `clockSkewInMs` de 5000ms (default) a 30000ms, dando margen suficiente para clocks skew de hasta 30 segundos.

**2. Páginas de sign-in y sign-up como Client Components con redirect por recarga completa:**
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
"use client"

import { useAuth } from "@clerk/nextjs"
import { SignIn } from "@clerk/nextjs"
import { useEffect } from "react"

export default function SignInPage() {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = "/dashboard"
    }
  }, [isSignedIn])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {!isSignedIn && <SignIn />}
    </div>
  )
}
```
Mismo patrón en `app/sign-up/[[...sign-up]]/page.tsx`. El `window.location.href` fuerza una recarga completa de página (no SPA navigation), lo que permite que el middleware de Clerk lea la cookie de sesión directamente.

**3. `lib/profesional.ts` — Fix de upsert duplicado (descubierto durante debugging):**
Cuando un usuario se elimina de Clerk y se registra de nuevo con el mismo email, el `prisma.profesional.upsert({ where: { clerkId } })` fallaba con `Unique constraint failed on email`. Se agregó una búsqueda previa por email para re-enlazar el registro existente al nuevo clerkId.

### Archivos modificados
- `proxy.ts` — `clockSkewInMs: 30_000`
- `app/sign-in/[[...sign-in]]/page.tsx` — Client Component con `useAuth` + redirect
- `app/sign-up/[[...sign-up]]/page.tsx` — Client Component con `useAuth` + redirect
- `lib/profesional.ts` — lookup por email antes de upsert

### Lección aprendida
- El clock skew del sistema de desarrollo puede romper la validación de JWT de Clerk. La tolerancia default (5000ms) es insuficiente si el reloj local está desviado ~10s o más.
- Siempre verificar el reloj del sistema ante problemas de autenticación con Clerk. Comando: `w32tm /resync`
- En desarrollo, los problemas de Clerk suelen manifestarse como "stuck en sign-in" sin error visible en consola.
- Forzar recarga completa (`window.location.href`) es más fiable que SPA navigation para el post-login redirect cuando hay incertidumbre sobre el estado de la sesión cliente.
- Los props de redirect de los componentes `<SignIn>`/`<SignUp>` no resuelven problemas de validación del token: atacan el síntoma (la ruta de destino) pero no la causa (el token no se verifica).

---
