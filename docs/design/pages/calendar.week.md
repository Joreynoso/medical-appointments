# Vista Semanal — Agenda (Calendario)

Estructura y comportamiento de la vista semanal de la agenda, estilo Google Calendar.

---

## Vista general

```
┌──────────────────────────────────────────────────────────────────┐
│  [←] [→]   Junio 2026   [Hoy]   [Mes] [■ Sem]                  │ ← toolbar (compartido con vista mes)
├──────────────────────────────────────────────────────────────────┤
│        Lun 10    Mar 11    Mié 12    Jue 13    Vie 14           │ ← sticky header row
├────┬─────────────────────────────────────────────────────────────┤
│ 07 │  ┌──────────────────────────────────────────────────────┐   │
│    │  │ turno 09:00-10:00                                    │   │
│ 08 │  └──────────────────────────────────────────────────────┘   │
│    │                                                             │
│ 09 │  ┌──────────────────────────────────────────────────────┐   │
│    │  │ turno 10:00-10:30  (Paciente)                       │   │
│ 10 │  └──────────────────────────────────────────────────────┘   │
│    │                                                             │
│ 11 │                                                             │
│    │                                                             │
│ 12 │                                                             │
│    │                                                             │
│ 13 │                                                             │
│    │                                                             │
│ 14 │                                                             │
│    │                                                             │
│ 15 │  ┌──────────────────────────────────────────────────────┐   │
│    │  │ turno 16:00-17:00                                    │   │
│ 16 │  └──────────────────────────────────────────────────────┘   │
│    │                                                             │
│ 17 │                                                             │
│    │                                                             │
│ 18 │                                                             │
│    │                                                             │
│ 19 │                                                             │
│    │                                                             │
│ 20 │                                                             │
└────┴─────────────────────────────────────────────────────────────┘
```

---

## Stack

```
components/agenda/
├── calendar-utils.ts         ← Lógica de fechas (getWeekDays, formatMonthYear, etc.)
├── week-view.tsx             ← Google Calendar grid layout (unified CSS grid)
├── calendar-toolbar.tsx      ← Mismo toolbar compartido con vista mes
└── agenda-client.tsx         ← Estado que alterna entre MonthView y WeekView
```

Nota: `day-card.tsx` NO se usa en vista semanal. La vista semanal tiene su propio renderizado inline de turnos.

---

## Componentes

### WeekView (Client Component)
- Props: `currentDate: Date`, `feriados: Map<string, string>`
- Obtiene 7 días desde `getWeekDays(currentDate)` → `DayInfo[]`
- Los 7 días corresponden a la semana que contiene `currentDate` (lunes a domingo)
- Layout: **Single CSS grid** unificado para header + body

### Grid unificado

```tsx
const HOUR_HEIGHT = 56  // px por hora
const START_HOUR = 7
const END_HOUR = 20
const ROWS = END_HOUR - START_HOUR  // 13

<div
  className="grid"
  style={{
    gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
    gridTemplateRows: `auto repeat(${ROWS}, ${HOUR_HEIGHT}px)`,
  }}
>
```

### Header row
- `sticky top-0 z-20 bg-background` dentro del grid
- `gridRow: 1` ocupa toda la fila superior
- Cada celda: `flex-col items-center gap-0.5 py-2`, `border-b border-border`
- Nombre del día: `text-xs font-medium text-muted-foreground`
- Número de fecha: `text-sm font-medium leading-none text-foreground`
- Columna 0 (time gutter): vacía en el header

### Time gutter (columna izquierda)
- 13 celdas (07:00–20:00), cada una `gridRow: index + 2, gridColumn: 1`
- Label: `text-xs text-muted-foreground pr-2 text-right sticky left-0 bg-background`, `border-b border-border h-full flex items-start pt-0`
- Posicionadas en el borde superior de la hora

### Day columns (7 columnas, lunes a domingo)
- Cada columna tiene 13 celdas de `HOUR_HEIGHT`px
- Celda individual: `min-h-full`, `border-b border-border border-r border-border`
- Toda la columna recibe clase `bg-muted` si el día es domingo
- Cada día tiene su propio `div` contenedor relativo para overlay de turnos

### Turnos overlay
- Cada turno se renderiza con posición absoluta dentro del contenedor del día
- `top` calculado: `((horaInicio.hour + horaInicio.minute / 60) - START_HOUR) * HOUR_HEIGHT`
- `height` calculado: `((horaFin - horaInicio) en horas) * HOUR_HEIGHT`
- Min height: `HOUR_HEIGHT / 2` (para turnos muy cortos)
- Estilo: `rounded-md bg-muted/50 border-l-4 border-l-primary p-1.5 w-[95%]`
- Contenido: `text-xs font-medium` para el paciente, `text-[10px] text-muted-foreground` para hora

### Scroll
- `WeekView` NO tiene su propio scroll container
- La página (`section.content-area.flex-1.overflow-y-auto`) es el contenedor de scroll
- `maxHeight` y `overflow` no se definen en el componente

---

## Navegación

- El toolbar es exactamente el mismo que en vista mensual (compartido via `CalendarToolbar`)
- En modo semana, prev/next suman/restan 7 días (`addWeeks(date, ±1)`)
- El título muestra el mes/año de la fecha actual
- "Hoy" navega a la semana actual
- Cambio a vista mensual via toggle Mes/Sem en el toolbar

---

## Datos

### Turnos
- Fetch via Server Action `getTurnosEnRango(fechaInicio, fechaFin)` en `lib/actions/turnos.ts`
- Ejecutado en `agenda-client.tsx` via `useActionState` + `useEffect`
- `getTurnosEnRango` es una función `"use server"` de módulo
- Llama a `getCurrentProfesional()` que internamente usa `auth.protect()` como guardia secundaria
- Los turnos se filtran por profesional autenticado

### Slots (franja horaria disponible)
- NO se persisten en la base de datos
- Se generan dinámicamente en el cliente desde `ConfiguracionProfesional`
- La configuración define bloques de disponibilidad recurrente (ej. Lun-Vie 08:00-17:00)
- Los slots en la UI se renderizan basados en esta configuración y los turnos existentes

---

## Diferencias con vista mensual

| Aspecto | Mensual | Semanal |
|---|---|---|
| Días visibles | 28–42 (grilla completa) | 7 (una semana) |
| Layout | Grid de cards cuadradas | Google Calendar (horas × días) |
| Turnos | No se muestran | Sí, overlay por hora |
| Slots | No aplica | Generados dinámicamente |
| Scroll | No requiere | Vía page container |
| Navegación prev/next | ±1 mes | ±1 semana |
| Días de otro mes | Sí, se muestran con opacidad | Sí, si la semana cruza de mes |
| Caso de uso | Visión general del mes | Gestión detallada de turnos |

---

## Constants

| Constante | Valor |
|---|---|
| `HOUR_HEIGHT` | 56 px |
| `GUTTER_WIDTH` | 48 px |
| `START_HOUR` | 7 (07:00) |
| `END_HOUR` | 20 (20:00) |
| `ROWS` | 13 |

---

## Comportamiento

- Misma lógica de feriados que vista mensual (mismo `Map`, misma server action)
- Al navegar entre semanas, si el año cambia se fetchan feriados lazy
- Sin cambios de layout al alternar entre mes y semana — el toolbar permanece en page-header
- Los slots se regeneran al cambiar de semana o al modificar configuración
- Llamadas a Groq minimizadas: no se usa LLM para generar slots, solo datos de DB
