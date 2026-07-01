# Diseño UI — Medical Appointments

## Sistema tipográfico

- **Contenido general** → `font-sans` (Inter, weight 400 regular, sin itálicas)
- **Titulares (h1, h2, h3)** → `font-sans` con `font-semibold`
- **Código** → `font-mono` (Fira Code)

### Reglas

- Los titulares usan `font-semibold`. El contenido general se mantiene en peso regular.
- Cuando se quiere destacar una palabra o frase dentro de un texto, se usa el color `text-accent`.
- No se usan otros colores (primary, secondary, etc.) para resaltar dentro de párrafos.
- **Sin separadores horizontales** (`border-t`, `border-b`) entre secciones de modales, cards o páginas. La separación entre secciones se logra únicamente con espaciado (`space-y-*`, `mt-*`, `mb-*`, `gap-*`).
