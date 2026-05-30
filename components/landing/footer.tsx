export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
        <p className="font-serif">
          Medical<span className="text-accent">Appointments</span>
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
