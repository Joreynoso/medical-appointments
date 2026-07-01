import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal"],
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
        className={`${inter.variable} ${firaCode.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans">
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem("theme");
                    if (theme === "dark") {
                      document.documentElement.classList.add("dark");
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
