# GreenSync — execution summary

Portfolio target: **Sol Invictus Energy Navigator** ecosystem (Energy Navigator + HOT2000 ingestion story).

Implemented:

1. **Vite + React + TS** with Tailwind v4 + path alias `@`.
2. **Routing + auth shells** (`/login`, protected `/dashboard`) via React Router + Supabase email/password session.
3. **Postgres schema** [`supabase/migrations/…`](supabase/migrations/20260505120000_create_buildings.sql) with Row Level Security keyed on `auth.uid`.
4. **`.h2k` XML ingestion** [`src/lib/parseH2k.ts`](src/lib/parseH2k.ts)—real parsing + deterministic `<GreenSyncCompliance>` overlays for fixtures.
5. **Compliance evaluator** [`src/lib/compliance.ts`](src/lib/compliance.ts)—demo thresholds separated from ingestion for unit tests (`pnpm test`).
6. **Dashboard UI**—sticky demo banner, Mapbox pins, TanStack-backed table, inspection card, toaster feedback.
7. **Docs/env** `.env.example` + [`README`](README.md) mapping HOT200 XML tags ↔ columns.

Outstanding ideas (optional backlog): lazy-load Mapbox chunks, realtime updates, Postgres type generation CI, fuller HOT200 XPath coverage.
