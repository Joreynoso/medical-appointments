# Diseño UI — Medical Appointments

## Sistema tipográfico

- **Títulos** → `font-serif` (Georgia, weight 400 regular únicamente)
- **Contenido y párrafos** → `font-sans` (DM Sans)
- **Código** → `font-mono` (Fira Code)

### Reglas

- Los elementos con `font-serif` **nunca** usan `font-bold`, `font-semibold` ni `font-medium`. Se mantienen siempre en peso regular.
- Cuando se quiere destacar una palabra o frase dentro de un texto, se usa el color `text-accent`.
- No se usan otros colores (primary, secondary, etc.) para resaltar dentro de párrafos.
- **Sin separadores horizontales** (`border-t`, `border-b`) entre secciones de modales, cards o páginas. La separación entre secciones se logra únicamente con espaciado (`space-y-*`, `mt-*`, `mb-*`, `gap-*`).
