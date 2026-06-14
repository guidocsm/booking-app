# Residencial Montelima

Premium, mobile-first booking app for residents of the Residencial Montelima gated community (Tres Cantos, Madrid). Quiet-luxury design language, Spanish (es-ES) UI.

This repository currently contains the **foundation** (step 1): fonts, Tailwind theme tokens, Supabase wiring, the mobile-first shell, the bottom tab bar, placeholder routes, and shared constants/helpers. Feature logic is intentionally not built yet.

## Stack

- Next.js (App Router), JavaScript/JSX only
- Tailwind CSS + shadcn/ui conventions
- lucide-react icons
- `@supabase/ssr` for auth/session handling
- `next/font`: Fraunces (display serif) + Geist (UI sans)

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` with the Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Routes

- `/` → redirects to `/inicio`
- `/inicio`, `/reservas`, `/perfil` → main app sections (auth-protected)
- `/login` → minimal placeholder (auth flow added in a later step)

Unauthenticated visits to a protected route redirect to `/login` via middleware.
