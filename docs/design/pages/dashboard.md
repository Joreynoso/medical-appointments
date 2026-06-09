# Dashboard Base — Arquitectura UI

Layout base del dashboard: estructura, componentes y decisiones de diseño.

---

## Stack

```
app/dashboard/
├── layout.tsx              ← Topbar + PageHeaderActionsProvider + Content Area
├── page.tsx                ← Home con PageHeader

components/dashboard/
├── dashboard-shell.tsx     ← SidebarProvider + Sidebar + Main Content
├── sidebar-context.tsx     ← Contexto colapsable (SidebarProvider, useSidebar)
├── sidebar.tsx             ← Compone sidebar-header + collapse btn + nav + user
├── sidebar-header.tsx      ← Logo "MedPilot" + icono Calendar
├── sidebar-nav.tsx         ← Navegación (Client Component)
├── sidebar-user.tsx        ← Avatar + preview image + nombre + logout (Client Component)
├── topbar.tsx              ← Barra superior con botón "Nuevo turno"
├── page-header.tsx         ← Título + descripción por ruta + slot de acciones
├── page-header-context.tsx ← Contexto para inyectar acciones al header
└── page-header-actions-client.tsx  ← Renderiza acciones injectadas
```

---

## Estructura general

```
┌──────────────────────────────────────────────────┐
│ Sidebar  │ Topbar                         [+Nvo] │
│ (colapsa │──────────────────────────────────────│
│  64|256) │ PageHeader: Título + descripción     │
│          │ Content Area (scroll)                │
└──────────────────────────────────────────────────┘
```

---

## DashboardShell + SidebarProvider

```tsx
<SidebarProvider>
  <div className="dashboard-shell flex min-h-screen">
    <Sidebar />
    <main className={cn("main-content flex flex-1 flex-col", collapsed ? "ml-16" : "ml-64")}>
      {children}
    </main>
  </div>
</SidebarProvider>
```

Sidebar colapsable vía `sidebar-context` (toggle animado `duration-300`).

---

## Topbar

```tsx
<header className="topbar flex h-16 shrink-0 items-center justify-end border-b border-border/60 bg-background px-8 gap-3">
  <button className="...">+ Nuevo turno</button>
</header>
```

Solo el botón "Nuevo turno". Sin ThemeToggle — tema oscuro fijo.

---

## PageHeader + PageHeaderActionsProvider

```tsx
<section className="page-header flex items-center justify-between py-8">
  <div>
    <h1 className="text-xl font-serif text-foreground">{title}</h1>
    <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
  </div>
  <div className="page-header-actions flex items-center gap-3">
    <PageHeaderActionsClient />
  </div>
</section>
```

Config por ruta: titulo/descripción dinámicos según pathname. Las acciones (toolbars de agenda, etc.) se inyectan via `PageHeaderActionsContext`.

---

## Sidebar

Colapsable: `w-64` → `w-16`. Botón circular toggle con `ChevronLeft` (rota 180° al colapsar).

### SidebarHeader
Link a `/`. Logo `size-9 rounded-xl bg-sidebar-primary` con icono `Calendar` + nombre "MedPilot" (oculto al colapsar). `pt-7 pb-6`.

### SidebarNav (Client Component)
Items tipo pill. `mx-2` (expandido) / `mx-auto size-10` (colapsado).

| Estado | Estilo |
|---|---|
| Default | `text-sidebar-foreground/60` |
| Hover | `hover:bg-sidebar-accent/5 hover:text-sidebar-foreground` |
| Active | `bg-primary/10 text-primary` |

| Ruta | Label | Icono |
|---|---|---|
| `/dashboard` | Dashboard | LayoutDashboard |
| `/dashboard/agenda` | Agenda | Calendar |
| `/dashboard/pacientes` | Pacientes | Users |
| `/dashboard/chat` | Chat IA | MessageSquare |
| `/dashboard/configuracion` | Configuración | Settings |

### SidebarUser (Client Component)
Preview image (`/images/bg-dark.png`) oculta al colapsar. Avatar circular `bg-primary` con iniciales + nombre + email + logout (`LogOut`). Estado sin sesión: solo preview image.

---

## Content Area

```tsx
<section className="content-area flex-1 overflow-y-auto">
  {children}
</section>
```

Scroll solo aquí; sidebar y topbar fijos. Padding (`px-10 pb-10`) definido en cada page.

---

## Dashboard Home (page.tsx)

```tsx
<PageHeader title="MedPilot" description="Resumen de tu actividad" />
<div className="space-y-10" />
```

---

## Decisiones de diseño

- **Sidebar colapsable** — ahorra espacio en pantallas chicas sin perder navegación.
- **Topbar minimal** — solo acción principal, sin adornos ni theme switcher.
- **PageHeader dinámico** — cada módulo inyecta sus acciones vía contexto.
- **Nav pills flotantes** — `mx-2` para que el active pill no toque bordes.
- **Active state con tint** — `bg-primary/10` en lugar de fondo sólido.
- **Bordes mínimos** — única línea del layout es `border-r` de sidebar y `border-b` de topbar.
- **Consistencia con landing** — mismas utilities de card, botón y hover.
- **Solo tema oscuro** — sin ThemeToggle, sin lógica de tema claro.