'use client';

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";


const ClerkUser = dynamic(
  () => import("@/components/landing/clerk-user"),
  { ssr: false },
)

type NavbarProps = {
  isSignedIn: boolean
  initials: string
}

export default function Navbar({ isSignedIn, initials }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg text-foreground">
          MedPilot
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#caracteristicas" className="hover:text-foreground transition-colors">
              Características
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="#demo" className="hover:text-foreground transition-colors">
              Demo
            </Link>
          </div>

          <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <User className="size-4" />
              Ingresar
            </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <ClerkUser initials={initials} />
            </>
          )}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="sm:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        </div>
      </div>

      <div
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t border-border bg-background px-6 pb-4 pt-2 flex flex-col gap-3 text-sm text-muted-foreground">
          <Link
            href="#caracteristicas"
            onClick={() => setMobileOpen(false)}
            className="hover:text-foreground transition-colors"
          >
            Características
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileOpen(false)}
            className="hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="#demo"
            onClick={() => setMobileOpen(false)}
            className="hover:text-foreground transition-colors"
          >
            Demo
          </Link>
          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
