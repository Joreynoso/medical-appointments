# Configuración del consultorio

Estructura y componentes de la página de configuración.

---

## Vista general

```
┌──────────────────────────────────────────────────┐
│  Configuración                                   │ ← PageHeader
│  Personaliza tu consultorio                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Días laborables                                 │
│  [Lun] [Mar] [Mié] [Jue] [Vie] [Sáb]           │ ← toggle buttons
│                                                  │
│  Horario de atención                             │
│  Desde [08:00]         Hasta [19:00]            │ ← selects
│                                                  │
│  Duración del turno                              │
│  [30 minutos]                                    │ ← select
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  💾 Guardar cambios                      │   │ ← button rounded-full
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## Contenedor

- `max-w-lg` (left-aligned, no centrado)
- Form: `rounded-lg border border-border p-6` (mismo estilo que tabla de pacientes)
- `space-y-8` entre secciones

## Botón guardar

- `rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground`
- Mismo estilo que botón "Nuevo turno" en Topbar
- Icono `Save` de lucide + texto "Guardar cambios"
- Estado submitting: reemplaza icono por `Loader2` con `animate-spin`, texto "Guardando..."

## Días laborables

- Array de botones `[Lun] [Mar] [Mié] [Jue] [Vie] [Sáb]`
- Activo: `bg-primary text-primary-foreground`
- Inactivo: `bg-muted text-muted-foreground`
- Domingo hard-bloqueado (no aparece)
- Toggle on/off al clickear

## Horarios

- `select` personalizado (no shadcn)
- Opciones: `06:00` a `22:00` cada 1 hora
- Grid 2 columnas (Desde / Hasta)

## Duración

- `select` personalizado
- Opciones: 15, 20, 25, 30, 45, 60 minutos