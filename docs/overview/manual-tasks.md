# Manual Tasks

## Sonner toaster — theme not fully applied

The Sonner `<Toaster>` was configured with CSS custom properties in `app/dashboard/layout.tsx`, but the custom theme from `globals.css` doesn't apply completely. Some elements (backgrounds, borders, text) don't reflect the design tokens.

Needs manual review of Sonner's `style` and `classNames` props to ensure full visual consistency with the custom palette.

## Clerk components — missing custom theme styles

Clerk UI components (sign-in, sign-up, user management) don't inherit the custom theme from `globals.css`. Some labels and text elements have low contrast or use default Clerk styles instead of the project's design tokens.

Needs manual theming via Clerk's `appearance` prop to map the custom palette to all Clerk component surfaces.
