# Filtros de agenda — FilterModal

Estructura y comportamiento del modal de filtros de la agenda.

---

## Vista general

```
┌───────────────────────────────────────────┐
│  Filtros                              [X] │ ← Dialog.Title text-lg font-serif
│                                           │
│  Paciente                                 │ ← label text-sm font-medium
│  ┌─────────────────────────────────────┐  │
│  │ 🔍 Buscar por nombre...             │  │ ← h-9 rounded-lg border px-3 pl-9
│  └─────────────────────────────────────┘  │
│                                           │
│  Estado del turno                          │ ← label text-sm font-medium
│  [Pendiente] [Confirmado] [Ausente]       │ ← pills border, active = bg-primary
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ ● García, Ana       Mar 24  10:00   │  │ ← scrollable list
│  │ ● López, Carlos     Mar 24  11:00   │  │    max-h-48 md:max-h-64
│  │ ● Martínez, Sof     Mar 25  09:00   │  │
│  │ ...                                  │  │
│  └─────────────────────────────────────┘  │
│  3 turnos                                 │ ← text-xs muted
│                                           │
│              [↻ Limpiar filtros]          │ ← Button variant="outline"
└───────────────────────────────────────────┘
```

---

## Stack

```
components/agenda/
├── filter-modal.tsx        ← Client Component: Dialog.Root con estilos
├── agenda-client.tsx       ← Estado de filtros (useState) + lógica de filtrado
└── calendar-toolbar.tsx    ← Botón "Filtrar" que abre el modal
```

---

## Comportamiento

### Apertura
- El botón "Filtrar" en `CalendarToolbar` abre el modal.
- Al abrir, se sincroniza el estado local del modal con los filtros actualmente aplicados (`useEffect` en `open`).

### Filtros en tiempo real
- Cada cambio en el input de paciente (onChange) o en las píldoras de estado (onClick) se aplica inmediatamente:
  1. Se actualiza el estado local del modal para la vista previa de resultados.
  2. Se actualiza el estado global en `AgendaClient` para que el calendario reaccione.
- No hay botón "Aplicar" — los cambios se reflejan al instante en ambas vistas.

### Filtrado de paciente
- Búsqueda client-side con `normalize("NFD")` + `toLowerCase()` — no discrimina acentos, diacríticos ni mayúsculas.
- Filtra por nombre del paciente (`t.paciente.nombre`).
- Sin debounce: la lista de turnos en el modal es pequeña (máximo ~200), el filtrado es instantáneo.

### Filtrado de estado
- Píldoras single-select (radio style): click en una píldora la activa, click en la activa la desactiva.
- Ninguna activa = mostrar todos los estados.
- La píldora activa tiene estilo `bg-primary text-primary-foreground border-primary`.
- La píldora inactiva tiene estilo `bg-background text-muted-foreground border-border`.

### Lista de resultados
- Se muestran solo turnos con `fecha >= today` (turnos pasados quedan excluidos del modal, no del calendario).
- Ordenados por fecha ascendente, luego por hora de inicio.
- Cada fila muestra: bullet de color (según estado), nombre del paciente (truncado), fecha formateada (`"Mar 24"`), hora (`"10:00"`).
- Colores de bullet: PENDIENTE = `bg-amber-400`, CONFIRMADO = `bg-emerald-500`, AUSENTE = `bg-gray-400`.
- Lista scrollable con `max-h-48 md:max-h-64 overflow-y-auto`.
- Si no hay resultados: mensaje "No se encontraron turnos" centrado en borde.
- Footer con contador: `"{n} turno(s)"`.

### Limpiar filtros
- Botón "Limpiar filtros" con icono `RotateCcw` resetea paciente y estado.
- Resetea tanto el estado local del modal como el estado global.
- No cierra el modal.

### Cierre
- Botón X en el header.
- Click fuera del modal (backdrop).
- No se pierden los filtros aplicados al cerrar/abrir (persisten en `AgendaClient`).

---

## Estados

| Condición | Comportamiento |
|---|---|
| Sin filtros, hay turnos | Lista completa de turnos (futuros) |
| Sin resultados de búsqueda | "No se encontraron turnos" |
| Filtro activo en calendario | Badge rojo en botón "Filtrar" (punto `size-2 bg-destructive`) |
| Modal cerrado con filtros activos | Badge continúa visible en toolbar |
| FilterState vacío al abrir | Input vacío, ninguna píldora activa |

---

## Espaciado

| Elemento | Clase |
|---|---|
| Contenedor modal | `p-6` |
| Gap header-content | `mb-6` |
| Gap secciones filtros | `space-y-5` |
| Gap label + input/pills | `space-y-1.5` |
| Gap pills | `gap-2` |
| Gap pills container | `flex flex-wrap gap-2` |
| Gap lista-resultados-header | `mt-4` |
| Gap filas de turnos | `gap-3` (flex items-center) |
| Padding fila de turno | `px-3 py-2.5` |
| Gap contador-lista | `mt-2` |
| Gap botón limpiar | `mt-4` |
| Gap botón limpiar borde derecho | `justify-end gap-3` |
| Input height | `h-9` |
| Pill height | `h-9` |

---

## Toolbar button

```
[←][→]  Mayo 2025  [🔽 Filtrar ●]  [Mes|Sem]
```

- Mobile: solo icono (`Button variant="outline" size="icon-sm" md:hidden`)
- Desktop: icono + texto (`Button variant="outline" size="sm" hidden md:inline-flex`)
- Badge activo: `absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive`
- Variante activa: `variant="default"` (fondo primary) cuando hay filtros, `variant="outline"` cuando no
