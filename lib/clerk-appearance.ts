import type { ClerkProviderProps } from "@clerk/react/types";

export const clerkAppearance: ClerkProviderProps["appearance"] = {
  variables: {
    colorPrimary: "var(--primary)",
    colorForeground: "var(--foreground)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--card)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInput: "var(--input)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    colorDanger: "var(--destructive)",
    colorSuccess: "#40a02b",
    colorWarning: "#fe640b",
    colorShadow: "var(--shadow-color)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-sans)",
    fontSize: "0.875rem",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  elements: {
    formButtonPrimary: {
      fontSize: "0.875rem",
      textTransform: "none",
    },
    card: {
      boxShadow: "var(--shadow-md)",
    },
    headerTitle: {
      fontFamily: "var(--font-serif)",
      fontWeight: 400,
    },
    headerSubtitle: {
      fontFamily: "var(--font-sans)",
    },
    footerActionLink: {
      color: "var(--primary)",
    },
    footerActionText: {
      color: "var(--muted-foreground)",
    },
  },
};
