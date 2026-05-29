# medical-appointments — Agent Rules

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 📚 Project context — read before anything else

Before starting any task, read these documents in order:

1. `docs/overview/project.overview.md` — what the project is, who it's for, stack and scope
2. `docs/overview/project.decisions.md` — architectural decisions already made, do not contradict them
3. `docs/overview/project.features.md` — feature list with MoSCoW priority and current status
4. `docs/overview/project.schema.md` — database models, types, relations and design decisions
5. `docs/design/design.typography.md` — UI decisions, typography system, component behavior (when available)

---

## 🔒 Non-negotiable rules

### Work scope
- **One feature at a time.** Never start a new feature until the current one works end to end.
- **Never touch code outside the current feature scope.** If you find something broken or improvable outside scope, stop and notify the developer before doing anything.
- **Never assume — always ask.** If you find two valid ways to solve a problem, present both options and wait for a decision before writing code.

### Database
- **Never run Prisma migrations without explicit approval.** Describe what the migration will do and wait for confirmation.
- **Never hard delete records.** Always use soft delete (`activo: boolean`). This is especially critical for `Paciente`.
- **Never persist empty slots.** Slots are generated dynamically from `ConfiguracionProfesional` at runtime — never store them in the database.
- **Never query the feriados API at runtime.** The `Feriado` table is the only source of truth for holidays. Read from there.

### Dependencies
- **Never install a new package without asking first.** Describe why it's needed and wait for approval.
- **Always check shadcn/ui first.** If the component exists there, use it. Do not reach for external UI libraries.

### TypeScript
- **Never use `any`.** Always type correctly. If the type is complex, define an explicit interface or type.

### React / Next.js
- **Server Components by default.** Only use Client Components (`"use client"`) when strictly necessary (interactivity, browser APIs, hooks).
- **Prefer Server Actions over API routes** for form submissions and data mutations.

### LLM / Groq
- **Minimize LLM calls.** Do not call Groq if the action can be resolved with database data alone.
- **Direct buttons bypass the model.** Quick access buttons in the chat trigger tools directly — they do not go through the LLM.
- **Always include a system prompt** in every Groq request that contextualizes the model as a medical appointment assistant.
- **Always send conversation history** with a hard cap (to be defined in ADR-008) to avoid unnecessary token usage.

---

## 🗂️ Stack reference

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Auth | Clerk |
| Database | Neon (PostgreSQL) |
| ORM | Prisma |
| UI | Tailwind CSS + shadcn/ui |
| LLM | Groq API |
| Holidays | `Feriado` table (pre-loaded, no external calls at runtime) |

---

## 📁 Folder conventions

```
medical-appointments/
├── docs/                        # Project documentation
├── prisma/                      # Schema and migrations
├── src/
│   ├── app/                     # Next.js App Router routes
│   │   ├── (auth)/              # Auth routes (Clerk)
│   │   ├── (dashboard)/         # Protected routes
│   │   └── api/                 # API routes (only when Server Actions won't do)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (do not modify)
│   │   └── [feature]/           # Feature-specific components
│   ├── lib/                     # Utilities, Prisma client, helpers
│   ├── actions/                 # Server Actions grouped by feature
│   └── types/                   # Shared TypeScript types and interfaces
├── AGENTS.md
└── .env.local
```

---

## 📝 Decision logging

When you make a relevant technical or design decision during development, append it to `docs/overview/project.decisions.md` using the existing ADR template at the bottom of that file. Do not skip this step — it is part of the development workflow.

A decision is relevant if it involves:
- Choosing between two valid implementation approaches
- Deviating from a pattern already established in the codebase
- Adding a new convention, utility, or abstraction
- Discovering a constraint that affects future features

---

## 🚫 Never do this

- Use `any` in TypeScript
- Delete records physically from the database
- Run Prisma migrations without approval
- Install packages without approval
- Call the feriados API at runtime
- Store empty slots in the database
- Start a new feature before the current one is complete
- Make changes outside the current feature scope without notifying the developer
- Choose between two approaches without asking first