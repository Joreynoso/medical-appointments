# Pacientes — Lista y CRUD

Estructura y comportamiento de la página de gestión de pacientes.

---

## Vista general

```
┌──────────────────────────────────────────────────────────────────┐
│  [🔍 Buscar paciente...]                      [+ Nuevo paciente] │ ← barra de búsqueda + acción
├──────────────────────────────────────────────────────────────────┤
│  Nombre         │ Teléfono           │ Notas             │ Acc.   │ ← header de tabla
├──────────────────────────────────────────────────────────────────┤
│  García, Ana   │ +54 11 1234-5678   │ Alergia a...      │ ✏️ 🗑️  │
│  López, Carlos │ —                   │ —                 │ ✏️ 🗑️  │
│  Martínez, Sof │ +54 11 8765-4321   │ —                 │ ✏️ 🗑️  │ ← rows con hover
│  Rodríguez, Ju │ +54 11 9988-7766   │ Prefiere turnos   │ ✏️ 🗑️  │
│  ...           │                     │                   │        │
└──────────────────────────────────────────────────────────────────┘

Modal (crear/editar):
┌───────────────────────────────────────┐
│  Nuevo paciente                   [X] │
├───────────────────────────────────────┤
│  Nombre *                             │
│  ┌─────────────────────────────────┐  │
│  │ Nombre completo                 │  │
│  └─────────────────────────────────┘  │
│  Teléfono                             │
│  ┌─────────────────────────────────┐  │
│  │ +54 11 1234-5678               │  │
│  └─────────────────────────────────┘  │
│  Notas (solo editar)                  │
│  ┌─────────────────────────────────┐  │
│  │ Notas internas...               │  │
│  └─────────────────────────────────┘  │
│                       [Cancelar] [Crear]│
└───────────────────────────────────────┘
```

---

## Stack

```
app/dashboard/pacientes/
├── page.tsx         ← Client Component: listado, búsqueda, modal CRUD, delete dialog
├── loading.tsx      ← Skeleton: pulse placeholders (search bar + 5 rows)
└── error.tsx        ← Error boundary con botón "Reintentar"

lib/actions/
└── pacientes.ts     ← Server Actions: listar, crear, actualizar, desactivar
```

Nota: No hay componentes extraídos en `components/pacientes/` — todo el UI es autocontenido en `page.tsx`.

---

## Componentes

### PacientesPage (Client Component)
- Todo el estado es local (`useState`), sin librería externa de estado
- Fetch inicial con `useEffect` + `useCallback` (debounce 300ms)
- Búsqueda client-side con debounce de 1000ms y normalización Unicode (NFD) para búsqueda accent-insensitive
- Modal y AlertDialog de `@base-ui/react` para crear/editar y eliminar

**Estados locales:**

| Variable | Tipo | Propósito |
|---|---|---|
| `pacientes` | `PacienteListData[]` | Lista completa desde servidor |
| `filteredPacientes` | `PacienteListData[]` | Subset filtrado por búsqueda |
| `busqueda` | `string` | Valor del input de búsqueda |
| `loading` | `boolean` | Indicador de carga inicial |
| `modalOpen` | `boolean` | Control del modal crear/editar |
| `modalMode` | `"crear" \| "editar" \| null` | Modo del modal |
| `selectedPaciente` | `PacienteListData \| null` | Paciente en edición |
| `deleteDialogOpen` | `boolean` | Control del diálogo de eliminar |
| `pacienteToDelete` | `PacienteListData \| null` | Paciente pendiente de eliminar |
| `submitting` | `boolean` | Deshabilita form durante submit |

---

## Barra de búsqueda

```
[🔍 Search icon (absolute)]  [input text]     [+ Plus icon] Nuevo paciente
```

- Input: `rounded-lg border border-border bg-background h-9 pl-9 pr-3 text-sm`
- Search icon: Lucide `Search`, `size-4`, `absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`
- Botón "Nuevo paciente": `Button size="lg"` con `Plus className="size-4"`
- Placeholder: `"Buscar paciente..."`

---

## Tabla de pacientes

```
┌──────────────────────────────────────────────────────────────────┐
│  Nombre         │ Teléfono      │ Notas              │ Acciones   │ ← th text-xs uppercase
├──────────────────────────────────────────────────────────────────┤
│  García, Ana   │ +54 11...     │ Alergia a...      │ [✏️] [🗑️]  │ ← td text-sm
│  López, Carlos │ —             │ —                  │ [✏️] [🗑️]  │
└──────────────────────────────────────────────────────────────────┘
```

- `rounded-lg border border-border`
- Header: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Celdas de datos: `text-sm`, nombre en `font-medium text-foreground`, resto en `text-muted-foreground`
- Valores nulos: `"—"` (em dash)
- Notas truncadas: `max-w-xs truncate`
- Hover en fila: `group hover:bg-muted/50`
- Divisores: `border-b border-border` en header, `divide-y divide-border` en tbody

**Columnas:**

| Columna | Alineación | Contenido |
|---|---|---|
| Nombre | left | `font-medium text-foreground` |
| Teléfono | left | `text-muted-foreground` o `"—"` |
| Notas | left | `truncate max-w-xs` o `"—"` |
| Acciones | right | Botones ghost `icon-sm` |

**Botones de acción por fila:**
- Editar: `Button variant="ghost" size="icon-sm"` con `Pencil className="size-4"`
- Eliminar: `Button variant="ghost" size="icon-sm"` con `Trash2 className="size-4 text-destructive"`

---

## Modal crear/editar (Dialog.Root)

```
┌───────────────────────────────────────────┐
│  Nuevo paciente / Editar paciente    [X]  │ ← Dialog.Title text-lg font-serif
├───────────────────────────────────────────┤
│  Nombre *                                 │ ← label text-sm font-medium
│  ┌─────────────────────────────────────┐  │
│  │ input text (required)               │  │ ← h-9 rounded-lg border px-3
│  └─────────────────────────────────────┘  │
│  Teléfono                                 │
│  ┌─────────────────────────────────────┐  │
│  │ input tel, placeholder ejemplo      │  │
│  └─────────────────────────────────────┘  │
│  Notas (solo en editar)                   │ ← conditional
│  ┌─────────────────────────────────────┐  │
│  │ textarea rows={3}                   │  │
│  └─────────────────────────────────────┘  │
│                          [Cancelar] [Crear]│ ← gap-3, justify-end
└───────────────────────────────────────────┘
```

- Backdrop: `bg-black/40`, `fixed inset-0`
- Popup: `rounded-xl border border-border bg-card p-6 shadow-lg`, `max-w-md`
- Form: `form action={handleSubmit}` (HTML nativo, no react-hook-form)
- Nombre: `required`, marcado con `span text-destructive *`
- Teléfono: `type="tel"`, opcional
- Notas: solo visible en modo `"editar"`
- Submit: deshabilitado mientras `submitting === true`
- Texto submit: `"Crear paciente"` / `"Guardar cambios"` / `"Guardando..."`
- Botón cerrar: `rounded-lg hover:bg-muted` con icono SVG inline X

---

## Diálogo de desactivar (AlertDialog.Root)

```
┌───────────────────────────────────────────┐
│  Desactivar paciente                      │ ← AlertDialog.Title text-lg font-serif
├───────────────────────────────────────────┤
│  ¿Estás seguro de desactivar a            │ ← text-sm text-muted-foreground
│  **{nombre}**?                            │
│  Los turnos históricos se conservarán.    │
│                                           │
│              [Cancelar] [Desactivar]      │ ← destructive variant
└───────────────────────────────────────────┘
```

- `AlertDialog.Description` con texto informativo
- Botón "Desactivar": `Button variant="destructive"`
- No hay confirmación por teclado — solo clic en botón

---

## Estados vacíos

| Condición | Mensaje | Acción |
|---|---|---|
| `loading === true` | "Cargando pacientes..." | Spinner de texto centrado |
| Sin pacientes y sin búsqueda | "No hay pacientes registrados" | Botón "Crear primer paciente" outline |
| Sin resultados de búsqueda | "No se encontraron pacientes" | Ninguna |

---

## Server Actions

Archivo: `lib/actions/pacientes.ts`

Todas usan `"use server"`, autentican con `getCurrentProfesional()` y llaman `revalidatePath("/dashboard/pacientes")` tras mutar.

| Acción | Parámetros | Comportamiento |
|---|---|---|
| `listarPacientes()` | — | `findMany` con `activo: true`, ordenado por `nombre asc`, scope `profesionalId` |
| `crearPaciente(data)` | `{ nombre, telefono? }` | `create` vinculado al profesional autenticado |
| `actualizarPaciente(id, data)` | `{ nombre, telefono?, notas? }` | `update` con `WHERE id AND profesionalId` |
| `desactivarPaciente(id)` | `id: string` | Soft delete: `update` set `activo = false` |

---

## Tipo compartido

```typescript
export type PacienteListData = {
  id: string
  nombre: string
  telefono: string | null
  notas: string | null
  createdAt: Date
  updatedAt: Date
}
```

---

## Espaciado

| Elemento | Clase |
|---|---|
| Contenedor página | `space-y-6` |
| Search bar + botón | `flex items-center gap-3` |
| Input búsqueda | `h-9`, `pl-9`, `pr-3` |
| Celdas tabla | `px-4 py-3` |
| Padding content area | `px-10 pb-10` (layout) |
| Padding modal | `p-6` |
| Gap entre botones modal | `gap-3` |
| Gap entre campos form | `space-y-4` |
| Gap label + input | `space-y-2` |

---

## Comportamiento

- **Fetch inicial** con 300ms de debounce para evitar race conditions en montaje
- **Búsqueda client-side**: debounce 1000ms, normalización NFD para ignorar acentos
- **Modal crear/editar**: mismo diálogo, cambia contenido según `modalMode`
- **Campo notas**: solo visible en edición (no se pide al crear)
- **Soft delete**: `desactivarPaciente` setea `activo = false`; turnos históricos se conservan
- **Toast**: `sonner` para feedback de éxito/error en cada operación
- **Refetch automático** tras crear, actualizar o desactivar
- **Loading skeleton**: animación pulse simulando search bar + header + 5 filas
- **Error boundary**: captura errores de render/ruteo, muestra "Error al cargar pacientes" + botón "Reintentar"
