# Landing Page

| Aspecto | Detalle |
|---|---|
| Ruta | `/` (`app/page.tsx`) |
| Tipo | Server Component (composición plana) |
| Grupo de rutas | Ninguno — raíz directa |

---

## Estructura (top-to-bottom)

| # | Sección | Componente | Archivo |
|---|---|---|---|
| 1 | **Navbar** | `Navbar` (Client Component) | `components/landing/navbar.tsx` |
| 2 | **Hero** | `HeroSection` | `components/landing/hero-section.tsx` |
| 3 | **Cards (Features)** | `CardsSection` | `components/landing/cards-section.tsx` |
| 4 | **CTA / Demo** | `CtaSection` (Client Component) | `components/landing/cta-section.tsx` |
| 5 | **FAQ** | `FaqSection` | `components/landing/faq-section.tsx` |
| 6 | **Footer** | `Footer` | `components/landing/footer.tsx` |

---

## Navbar

- Sticky top, semi-transparent (`bg-background/80 backdrop-blur-sm`), 64px height
- **Logo:** "MedPilot" (serif), link a `/`
- **Enlaces desktop:** `#caracteristicas`, `#faq`, `#demo` (ocultos en mobile)
- **Auth (Clerk):**
  - No logueado → botón "Ingresar"
  - Logueado → link "Dashboard" + `<ClerkUser>` con iniciales
- Sin theme switcher — solo tema oscuro fijo

## Hero

- Grid 2 columnas en `md:`, padding vertical `py-20 md:py-32`
- **Columna izquierda:**
  - Título serif (`text-5xl` → `lg:text-7xl`, leading `[0.9]`): "Tu agenda médica, potenciada con *inteligencia artificial.*"
  - Subtítulo muted: "Gestioná turnos de forma simple, visual y eficiente."
  - CTA primario: "Comenzar ahora" → `/dashboard` (rounded-full, primary)
  - CTA secundario: "Más información" → `#` (placeholder, bordered)
- **Columna derecha:**
  - Wireframe vacío: `border-2 border-dashed` + icono `Camera` de lucide + label "Wireframe"

## Cards / Features (`#caracteristicas`)

- Grid `sm:cols-2 lg:cols-3 gap-6`, padding `py-24`
- 6 cards con icono, título y descripción:
  1. Agenda inteligente
  2. Recordatorios
  3. Multi-profesional
  4. Reportes y estadísticas
  5. Seguridad y privacidad
  6. Acceso multi-dispositivo

## CTA / Demo (`#demo`)

- Grid 2 columnas en `md:`, padding `py-24 md:py-32`
- **Columna izquierda:**
  - Título serif: "Probá cómo funciona con<br/>*lenguaje natural*"
  - Subtítulo muted: explica que el *chat en tiempo real* permite a profesionales consultar turnos sin buscar manualmente, con la frase `"chat en tiempo real"` en `text-accent italic`
  - CTA primario: "Probar ahora" → `/dashboard`
  - CTA secundario: "Ver documentación" → `#` (placeholder)
- **Columna derecha:**
  - Chat mockup animado (Client Component con `useEffect` + `setTimeout`)
  - Header: icono `Bot` + "Asistente de agenda · Consultas en tiempo real"
  - 4 mensajes simulados aparecen secuencialmente (1.8s entre cada uno):
    1. Médico: "¿Qué turnos tengo para mañana?"
    2. Asistente: lista los 4 turnos del día (Pérez 09:00, López 10:30, Martínez 15:00, García 16:30)
    3. Médico: "Mostrame los datos de Martínez"
    4. Asistente: muestra ficha del paciente (nombre, edad, motivo, teléfono, última visita)
  - Indicador de escritura (`animate-pulse`) entre mensajes del asistente
  - Input deshabilitado + botón de enviar decorativo
- Navbar link: `#demo` agregado entre FAQ y autenticación

## FAQ (`#faq`)

- `<details>` nativos, `max-w-3xl`, padding `py-24`
- 5 preguntas con icono `+` que rota 45° al abrir

## Footer

- Fondo naranja (`--primary`) con texto oscuro (`--accent`)
- Gigante "MedPilot" decorativo en `text-primary` sobre fondo oscuro general
- Dos columnas: marca + descripción + enlaces sociales (GitHub, email) | navegación
- Línea divisoria `border-border`, copyright y corazón decorativo
- Sin theme switcher — solo tema oscuro fijo

---

## Diseño y tema

- **Tipografía:** DM Sans (sans), Georgia (headings), Fira Code (mono)
- **Paleta:** Personalizada (light theme con acentos dorados, sin switcher de tema)
- **Radius base:** `0.5rem`
- **Idioma:** Español (es-AR)
