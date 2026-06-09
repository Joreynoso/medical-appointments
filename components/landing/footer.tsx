import Link from "next/link";
import { Heart, Mail } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* Giant MedPilot Text */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] text-center select-none leading-none pt-16 pb-6 md:pb-0 overflow-hidden bg-transparent relative z-10">
        <span className="text-[28vw] font-serif font-normal tracking-tighter block leading-[0.75] text-primary select-none whitespace-nowrap">
          MedPilot
        </span>
      </div>

      {/* Main Footer Block */}
      <footer className="inverted-footer bg-background text-foreground w-full min-h-[350px] md:h-[350px] pb-16 flex flex-col justify-between overflow-hidden -mt-6 relative z-0">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-start gap-12 mt-8">
          {/* Columna izquierda: Marca y descripción */}
          <div className="flex flex-col gap-4 max-w-md">
            <Link href="/" className="font-serif text-xl text-foreground">
              MedPilot
            </Link>
            <p className="text-sm text-foreground leading-relaxed font-sans">
              La plataforma inteligente de gestión de turnos y agenda médica diseñada para optimizar la atención de profesionales de la salud independientes.
            </p>
            <div className="flex items-center gap-4 mt-2 text-foreground">
              <a href="#" className="hover:opacity-80 transition-opacity" aria-label="GitHub">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
              <a href="mailto:soporte@medicalappointments.com" className="hover:opacity-80 transition-opacity" aria-label="Email">
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          {/* Columna derecha: Enlaces del navbar */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-serif text-foreground">
              Navegación
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-foreground font-sans">
              <li>
                <Link href="#caracteristicas" className="hover:opacity-80 transition-opacity">
                  Características
                </Link>
              </li>
              <li>
              <Link href="#faq" className="hover:opacity-80 transition-opacity">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#demo" className="hover:opacity-80 transition-opacity">
                  Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full border-t border-border pt-8 mt-12 md:mt-0 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground font-sans">
          <p>
            &copy; {new Date().getFullYear()} MedPilot. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="size-4 text-accent-foreground fill-accent-foreground animate-pulse" /> para profesionales de la salud.
          </p>
        </div>
      </footer>
    </>
  );
}
