import Link from "next/link";

const colors = [
  { name: "background", bg: "bg-background", text: "text-foreground" },
  { name: "foreground", bg: "bg-foreground", text: "text-background" },
  { name: "card", bg: "bg-card", text: "text-card-foreground", border: true },
  { name: "popover", bg: "bg-popover", text: "text-popover-foreground", border: true },
  { name: "primary", bg: "bg-primary", text: "text-primary-foreground" },
  { name: "secondary", bg: "bg-secondary", text: "text-secondary-foreground" },
  { name: "accent", bg: "bg-accent", text: "text-accent-foreground" },
  { name: "muted", bg: "bg-muted", text: "text-muted-foreground" },
  { name: "destructive", bg: "bg-destructive", text: "text-destructive-foreground" },
  { name: "border", bg: "bg-border", text: "text-foreground" },
  { name: "input", bg: "bg-input", text: "text-foreground" },
  { name: "ring", bg: "bg-ring", text: "text-background" },
  { name: "sidebar", bg: "bg-sidebar", text: "text-sidebar-foreground", border: true },
  { name: "chart-1", bg: "bg-chart-1", text: "text-background" },
  { name: "chart-2", bg: "bg-chart-2", text: "text-background" },
  { name: "chart-3", bg: "bg-chart-3", text: "text-background" },
  { name: "chart-4", bg: "bg-chart-4", text: "text-background" },
  { name: "chart-5", bg: "bg-chart-5", text: "text-background" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-sans text-foreground border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  );
}

function ColorSwatch({ name, bg, text, border }: { name: string; bg: string; text: string; border?: boolean }) {
  return (
    <div
      className={`w-full h-20 rounded-lg flex items-end p-2 text-xs font-mono font-medium ${bg} ${text} ${border ? "border border-border" : ""}`}
    >
      {name}
    </div>
  );
}

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-sans text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            medical<span className="text-sidebar-accent">.appointments</span>
          </Link>
          <span className="text-sm text-sidebar-foreground/60 font-mono">Theme Guide</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-sans tracking-tight">Guía de Estilos</h1>
          <p className="text-muted-foreground">
            Paleta completa del tema basada en Catppuccin Mocha (dark) / Latte (light).
            Todas las clases usan las variables CSS definidas en <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">globals.css</code>.
          </p>
        </header>

        <Section title="Paleta de colores">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {colors.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>
        </Section>

        <Section title="Tipografía">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground font-mono">font-sans (Inter)</p>
              <p className="text-base">Body text regular</p>
              <p className="text-sm text-muted-foreground">Body text muted</p>
              <p className="text-xs text-muted-foreground">Small / caption</p>
              <p className="text-base font-medium">Medium weight</p>
              <p className="text-base font-semibold">Semibold weight</p>
              <input
                type="text"
                placeholder="Input placeholder…"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground font-mono">font-sans (Inter) — Títulos</p>
              <h1 className="text-4xl font-sans">H1 Título</h1>
              <h2 className="text-3xl font-sans">H2 Título</h2>
              <h3 className="text-2xl font-sans">H3 Título</h3>
              <h4 className="text-xl font-sans">H4 Título</h4>
              <p className="text-lg font-sans">Cuerpo</p>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground font-mono">font-mono (Fira Code)</p>
              <p className="font-mono text-lg">const theme = &quot;catppuccin&quot;;</p>
              <p className="font-mono text-base">function App() {`{`} return null; {`}`}</p>
              <p className="font-mono text-sm text-muted-foreground">--primary: #1c2f40;</p>
              <p className="font-mono text-xs text-muted-foreground">npm run dev</p>
            </div>
          </div>
        </Section>

        <Section title="Botones">
          <div className="flex flex-wrap gap-3 items-center">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">Primary</button>
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity">Secondary</button>
            <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">Accent</button>
            <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity">Destructive</button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium text-sm transition-colors">Outline</button>
            <button className="px-4 py-2 rounded-lg hover:bg-muted text-foreground font-medium text-sm transition-colors">Ghost</button>
            <button className="px-4 py-2 text-sm text-primary hover:underline underline-offset-4 font-medium">Link</button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button disabled className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm opacity-50 cursor-not-allowed">Disabled</button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity">Small</button>
            <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">Large</button>
            <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">Pill</button>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-sans">Card title</h3>
                <p className="text-sm text-muted-foreground">This is a default card with border, background, and shadow.</p>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">Action</button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-primary/5 shadow-sm">
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-sans text-primary">Primary card</h3>
                <p className="text-sm text-muted-foreground">Card with a subtle primary background tint.</p>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">Action</button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="h-32 bg-muted rounded-t-xl flex items-center justify-center text-muted-foreground text-sm">Image placeholder</div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-sans">Card with image</h3>
                <p className="text-sm text-muted-foreground">Card with a top hero image area.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Formularios">
          <div className="grid sm:grid-cols-2 gap-6 max-w-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input</label>
              <input
                type="text"
                placeholder="Placeholder..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled</label>
              <input
                type="text"
                placeholder="Disabled..."
                disabled
                className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground placeholder:text-muted-foreground/50 text-sm cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select</label>
              <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Textarea</label>
              <textarea
                placeholder="Escribe algo..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="accent-primary rounded" />
              Checked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-primary rounded" />
              Unchecked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="radio" defaultChecked className="accent-primary" />
              Radio 1
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="radio" className="accent-primary" />
              Radio 2
            </label>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">Primary</span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">Secondary</span>
            <span className="px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">Accent</span>
            <span className="px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">Destructive</span>
            <span className="px-2.5 py-0.5 rounded-full border border-border text-foreground text-xs font-medium">Outline</span>
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">Muted</span>
          </div>
        </Section>

        <Section title="Alertas">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-primary text-lg leading-none mt-0.5">i</span>
              <div>
                <p className="text-sm font-sans">Información</p>
                <p className="text-sm text-muted-foreground">Mensaje informativo para el usuario.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="text-destructive text-lg leading-none mt-0.5">!</span>
              <div>
                <p className="text-sm font-sans">Error</p>
                <p className="text-sm text-muted-foreground">Algo salió mal. Intenta de nuevo.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <span className="text-accent text-lg leading-none mt-0.5">✓</span>
              <div>
                <p className="text-sm font-sans">Éxito</p>
                <p className="text-sm text-muted-foreground">La operación se completó correctamente.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Tabla">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="text-left px-4 py-3 font-sans">Name</th>
                  <th className="text-left px-4 py-3 font-sans">Role</th>
                  <th className="text-left px-4 py-3 font-sans">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Alice", role: "Admin", status: "Activo" },
                  { name: "Bob", role: "Doctor", status: "Inactivo" },
                  { name: "Carol", role: "Patient", status: "Activo" },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === "Activo" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Loading / Skeleton">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="space-y-3 flex-1 max-w-sm">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
            </div>
          </div>
        </Section>

        <Section title="Separadores">
          <div className="space-y-4">
            <div className="border-t border-border" />
            <div className="border-t border-dashed border-border" />
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="flex-1 border-t border-border" />
              <span>or</span>
              <div className="flex-1 border-t border-border" />
            </div>
          </div>
        </Section>

        <Section title="Toolbar / Navegación">
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-card">
            <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">Dashboard</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors">Patients</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors">Appointments</button>
            <div className="flex-1" />
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">JD</div>
          </div>
        </Section>

        <footer className="border-t border-border pt-8 pb-4 text-center text-sm text-muted-foreground">
          <p className="font-sans">Medical Appointments — Catppuccin Theme</p>
          <p className="text-xs mt-1">Light / Dark via <code className="bg-muted px-1 rounded text-xs font-mono">.dark</code> class</p>
        </footer>
      </div>
    </div>
  );
}
