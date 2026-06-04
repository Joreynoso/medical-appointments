# Vista Mensual — Agenda (Calendario)

Estructura y comportamiento de la grilla mensual de la agenda.

---

## Vista general

```
┌──────────────────────────────────────────────────────────┐
│  [←] [→]   Junio 2026   [Hoy]   [■ Mes] [◐ Sem]        │ ← toolbar en page-header-actions
├──────────────────────────────────────────────────────────┤
│  Lun  Mar  Mié  Jue  Vie  Sáb  Dom                      │ ← headers de día
├──────────────────────────────────────────────────────────┤
│    1    2    3    4    5    6    7                       │
│                                                          │
│    8    9   10   11   12   13   14                       │ ← cards cuadradas
│                                                          │   en grilla 7 col
│   15   16   17   18   19   20   21                       │
│                                                          │
│   22   23   24   25   26   27   28                       │
│                                                          │
│   29   30                                                 │
└──────────────────────────────────────────────────────────┘
```

---

## Stack

```
components/agenda/
├── calendar-utils.ts     ← Lógica de fechas (getMonthGrid, formatMonthYear, etc.)
├── day-card.tsx          ← Card cuadrada individual
├── month-view.tsx        ← Grilla mensual (7×N)
├── calendar-toolbar.tsx  ← Navegación: prev/next/hoy/mes-sem
└── agenda-client.tsx     ← Estado: currentDate, viewMode, feriados

app/dashboard/agenda/
└── page.tsx              ← Server component: fetch feriados + render AgendaClient
```

---

## Componentes

### AgendaClient (Client Component)
- Estado: `currentDate`, `viewMode`, `feriados Map<fecha, nombre>`
- Renderiza `CalendarToolbar` dentro del `page-header-actions` vía `usePageHeaderActions()`
- Cambia entre `MonthView` y `WeekView` según `viewMode`
- Navegación: en modo month, suma/resta 1 mes (`addMonths`); en week, suma/resta 1 semana (`addWeeks`)
- Botón "Hoy" resetea a fecha actual
- Feriados cacheados en `Map`; si navega a otro año, llama `getFeriadosEnRango` lazy

### MonthView (Client Component)
- Props: `year`, `month`, `feriados: Map<string, string>`
- Obtiene grilla desde `getMonthGrid(year, month)` → `DayInfo[][]`
- Headers: `grid grid-cols-7 gap-1`, textos `text-xs font-medium text-muted-foreground`
- Cuerpo: cada semana es un `grid grid-cols-7 gap-1` con 7 `DayCard`

### DayCard (Client Component)
```
┌──────────────┐
│           15 │  ← número día, top-right (text-sm font-medium)
│              │
│  Feriado X   │  ← solo si feriado (text-[11px] text-accent)
│              │
└──────────────┘
```
- `aspect-square` — card cuadrada
- `rounded-xl border p-2`
- Estados:
  | Condición | Estilo |
  |---|---|
  | Normal | `border-border bg-card` |
  | Hover | `hover:-translate-y-1 hover:shadow-lg hover:bg-card` |
  | Hoy | `border-primary/40` + tooltip "Hoy" al hover |
  | Feriado | `border-accent/30 bg-accent/5`, texto `text-accent` |
  | Domingo | `bg-muted/40`, `cursor-not-allowed`, `disabled`, sin hover |
  | Otro mes | `opacity-40` |
- Click → `toast` via sonner con fecha y descripción contextual
- Tooltip "Hoy" usa `TooltipContent` de shadcn (`bg-primary text-primary-foreground`)

---

## Toolbar (Navegación)

Renderizado dentro de `page-header-actions` (junto al título "Agenda", alineado a la derecha con `justify-between`).

```
[ChevronLeft] [ChevronRight]   Junio 2026   [CalendarDays + Hoy]   [Mes | Sem]
     icon-sm       icon-sm       min-w-[130px]     outline sm        toggle pill
```

- Botones prev/next: `Button variant="outline" size="icon-sm"` con iconos lucide
- Fecha: `span text-sm font-medium text-foreground min-w-[130px] text-center`
- Hoy: `Button variant="outline" size="sm"` con icono `CalendarDays`
- Toggle Mes/Sem: botones planos sin shadcn, `rounded-lg border border-border`
  - Activo: `bg-primary text-primary-foreground`
  - Inactivo: `bg-background text-muted-foreground`

---

## Feriados

- Cargados desde DB (tabla `Feriado`) vía server action `getFeriadosEnRango(año)`
- Pasan como `Map<"YYYY-MM-DD", nombre>` a las vistas
- Sincronización automática al cargar el dashboard (`sincronizarSiEsNecesario` en layout)
- Feriados de otro año se obtienen lazy al navegar fuera del año actual

---

## Espaciado

| Elemento | Clase |
|---|---|
| Grilla completa | `space-y-1` (entre headers y semanas) |
| Gap entre celdas | `gap-1` en cada `grid grid-cols-7` |
| Padding interno card | `p-2` |
| Padding content area | `px-10 pb-10` (layout) |

---

## Comportamiento

- **Scroll** solo en content area; toolbar fijo en page-header
- **Navegación** cambia el mes y actualiza el toolbar vía contexto
- **Click en día** → toast sonner con `position="top-center"`, colores de paleta
- **Domingos** no clickeables, visualmente deshabilitados
- **Días de otro mes** se muestran con opacidad reducida para contexto visual
