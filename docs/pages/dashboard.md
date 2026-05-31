# Dashboard Base — Arquitectura UI

Layout base del dashboard: estructura, componentes y decisiones de diseño. No cubre contenido específico de cada módulo (calendarios, tablas, etc.).

---

## Stack

```
app/dashboard/
├── layout.tsx              ← DashboardShell + DashboardHeader + content area
├── page.tsx                ← Home (vacío, contenido por módulo)

components/dashboard/
├── dashboard-shell.tsx     ← Sidebar + Main Content
├── dashboard-header.tsx    ← Saludo contextual + acciones (Client Component)
├── sidebar.tsx             ← Compone header + nav + user
├── sidebar-header.tsx      ← Logo + identidad visual
├── sidebar-nav.tsx         ← Navegación (Client Component)
├── sidebar-user.tsx        ← Avatar + nombre + logout (Client Component)
```

---

## Estructura general

```
┌─────────────────────────────────────────────────┐
│ Sidebar │ Main Content                          │
│ (fija)  │ DashboardHeader                       │
│ 256px   │  "Buenos días, Dr. Rodríguez"         │
│         │  "Aquí tienes un resumen de tu ag."   │
│         │                         🔔 🔍 [+Nuevo]│
│         │                                       │
│         │ Content Area (scroll)                 │
└─────────────────────────────────────────────────┘
```

No hay Topbar ni PageHeader independientes. El encabezado es un único bloque `DashboardHeader` sin `border-bottom`, fusionado visualmente con el contenido.

---

## DashboardShell

```tsx
<div className="dashboard-shell flex min-h-screen">
  <Sidebar />
  <main className="main-content ml-64 flex flex-1 flex-col">
    {children}
  </main>
</div>
```

Sidebar fija de 256px + main content.

---

## DashboardHeader (Client Component)

```tsx
<header className="dashboard-header flex items-center justify-between px-8 pt-8 pb-8">
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-semibold text-foreground">
      {getGreeting()}, {user?.firstName || "Profesional"}
    </h1>
    <p className="text-sm text-muted-foreground">
      Aquí tienes un resumen de tu agenda de hoy.
    </p>
  </div>
  <div className="flex items-center gap-2">
    <button aria-label="Buscar"><Search className="size-4" /></button>
    <button aria-label="Notificaciones"><Bell className="size-4" /></button>
    <button className="rounded-full bg-primary px-5 py-2.5 ...">
      <Plus className="size-4" /> Nuevo turno
    </button>
  </div>
</header>
```

Saluda contextualmente según la hora. Sin icono decorativo tras el nombre. Acciones integradas en el mismo bloque.

---

## Sidebar

```tsx
<aside className="sidebar fixed left-0 top-0 z-30 flex h-screen w-64 flex-col
                border-r border-sidebar-border/50 bg-sidebar text-sidebar-foreground">
  <SidebarHeader />
  <SidebarNav />
  <SidebarUser />
</aside>
```

Única línea: `border-r` al 50%. Sin bordes internos entre header, nav y user.

### SidebarHeader
Logo `size-9 rounded-xl` con icono `Calendar` + "Medical Appointments". `pt-7 pb-6`.

### SidebarNav (Client Component)
Items tipo pill con `mx-2`. Estados:
| Estado | Estilo |
|---|---|
| Default | `text-sidebar-foreground/60` |
| Hover | `hover:bg-sidebar-accent/5 hover:text-sidebar-foreground` |
| Active | `bg-primary/10 text-primary` (tint, no sólido) |

| Ruta | Label | Icono |
|---|---|---|
| `/dashboard` | Dashboard | LayoutDashboard |
| `/dashboard/agenda` | Agenda | Calendar |
| `/dashboard/pacientes` | Pacientes | Users |
| `/dashboard/chat` | Chat IA | MessageSquare |
| `/dashboard/configuracion` | Configuración | Settings |

### SidebarUser (Client Component)
Avatar `size-9 bg-primary/10` + nombre + email + logout (icono `LogOut` inline). Sin `border-t`.

---

## Content Area

```tsx
<section className="content-area flex-1 overflow-y-auto px-8 pb-8">
  {children}
</section>
```

Sin `padding-top` (se funde con el header). Scroll solo aquí; sidebar y header fijos.

---

## Dashboard Home (page.tsx)

```tsx
export default function DashboardPage() {
  return <div className="space-y-10" />
}
```

Home vacío como punto de partida. El contenido se agrega por módulo.

---

## Decisiones de diseño

- **Sin Topbar** — el header es un bloque único integrado con el contenido.
- **Bordes mínimos** — única línea del layout es `border-r` de la sidebar. Sin bordes internos ni entre header y contenido.
- **Nav pills flotantes** — `mx-2` para que el active pill no toque los bordes.
- **Active state con tint** — `bg-primary/10` en lugar de fondo sólido.
- **Menos líneas, más aire** — espaciado generoso (`px-8`, `pb-8`, `gap-8`, `p-7`).
- **Consistencia con landing** — mismas utilities de card, botón y hover en ambos.

---

## Comportamiento

- **Scroll** solo en content area; sidebar y header fijos.
- **Navegación** reemplaza únicamente `<section class="content-area">`, manteniendo sidebar y header.