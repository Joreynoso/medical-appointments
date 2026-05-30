'use client';

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";

export default function Navbar() {
  const { user } = useUser();
  const isSignedIn = !!user;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-foreground">
          Medical<span className="text-accent">Appointments</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#caracteristicas" className="hover:text-foreground transition-colors">
              Características
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <SignInButton>
              <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                <User className="size-4" />
                Ingresar
              </button>
            </SignInButton>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
