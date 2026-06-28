import type { Metadata } from "next";
import { DM_Sans, Fira_Code } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medical Appointments",
  description: "Sistema de turnos médicos inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={esES}>
      <html
        lang="es"
        className={`${dmSans.variable} ${firaCode.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
