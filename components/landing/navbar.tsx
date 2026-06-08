'use client';

import { useState } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Navbar() {
  const { user } = useUser();
  const isSignedIn = !!user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (
    user?.firstName?.charAt(0) ||
    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
    "?"
  ).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg text-foreground">
          Medical<span className="text-primary">Appointments</span>
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
            <ThemeToggle />
            <SignInButton>
              <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                <User className="size-4" />
                Ingresar
              </button>
            </SignInButton>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <ThemeToggle />
              <div className="relative flex items-center justify-center">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-8",
                      userButtonAvatarImage: "opacity-0",
                    },
                  }}
                />
                <div className="pointer-events-none absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {initials}
                </div>
              </div>
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

      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-6 pb-4 pt-2 flex flex-col gap-3 text-sm text-muted-foreground">
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
      )}
    </nav>
  );
}
