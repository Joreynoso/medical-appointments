# Vista Semanal — Agenda (Calendario)

Estructura y comportamiento de la vista semanal de la agenda.

---

## Vista general

```
┌──────────────────────────────────────────────────────────┐
│  [←] [→]   Junio 2026   [Hoy]   [Mes] [■ Sem]          │ ← toolbar (mismo que vista mes)
├──────────────────────────────────────────────────────────┤
│  Lun   Mar   Mié   Jue   Vie   Sáb   Dom                │ ← headers de día
├──────────────────────────────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│ │   │ │   │ │   │ │   │ │   │ │   │ │   │            │
│ │10 │ │11 │ │12 │ │13 │ │14 │ │15 │ │16 │            │ ← 7 cards cuadradas
│ │   │ │   │ │   │ │   │ │   │ │   │ │   │            │   en una fila
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘            │
└──────────────────────────────────────────────────────────┘
```

---

## Stack

```
components/agenda/
├── calendar-utils.ts     ← Lógica de fechas (getWeekDays, formatMonthYear, etc.)
├── day-card.tsx          ← Misma card cuadrada que vista mensual
├── week-view.tsx         ← Fila única de 7 cards
├── calendar-toolbar.tsx  ← Mismo toolbar compartido con vista mes
└── agenda-client.tsx     ← Estado que alterna entre MonthView y WeekView
```

---

## Componentes

### WeekView (Client Component)
- Props: `currentDate: Date`, `feriados: Map<string, string>`
- Obtiene 7 días desde `getWeekDays(currentDate)` → `DayInfo[]`
- Los 7 días corresponden a la semana que contiene `currentDate` (lunes a domingo)
- Headers: `grid grid-cols-7 gap-1`, textos `text-xs font-medium text-muted-foreground`
- Cuerpo: `grid grid-cols-7 gap-1` con 7 `DayCard` en una sola fila

### DayCard
Mismo componente que en vista mensual — ver `calendar.month.md` para especificación completa.

Comportamiento idéntico:
- `aspect-square`, `rounded-xl border p-2`
- Feriado → `border-accent/30 bg-accent/5 text-accent`
- Domingo → `bg-muted/40 cursor-not-allowed disabled`
- Hoy → `border-primary/40` + tooltip "Hoy"
- Otro mes → `opacity-40` (cuando la semana incluye días del mes anterior/siguiente)
- Click → toast sonner

---

## Navegación

- El toolbar es exactamente el mismo que en vista mensual (compartido via `CalendarToolbar`)
- En modo semana, prev/next suman/restan 7 días (`addWeeks(date, ±1)`)
- El título muestra el mes/año de la fecha actual
- "Hoy" navega a la semana actual
- Cambio a vista mensual via toggle Mes/Sem en el toolbar

---

## Diferencias con vista mensual

| Aspecto | Mensual | Semanal |
|---|---|---|
| Días visibles | 28–42 (grilla completa) | 7 (una semana) |
| Filas de cards | 4–6 | 1 |
| Navegación prev/next | ±1 mes | ±1 semana |
| Días de otro mes | Sí, se muestran con opacidad | Sí, si la semana cruza de mes |
| Caso de uso | Visión general del mes | Vista detallada de la semana |

---

## Espaciado

| Elemento | Clase |
|---|---|
| Contenedor | `space-y-1` |
| Gap entre celdas | `gap-1` en `grid grid-cols-7` |
| Padding card | `p-2` (mismo que vista mes) |

---

## Comportamiento

- Misma lógica de feriados que vista mensual (mismo `Map`, misma server action)
- Scroll horizontal no necesario (las 7 cards entran en el ancho del content area)
- Al navegar entre semanas, si el año cambia se fetchan feriados lazy
- Sin cambios de layout al alternar entre mes y semana — el toolbar permanece en page-header
