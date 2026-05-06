# GreenSync Dashboard

Portfolio demo aligned with municipal-style residential energy QA: ingest HOT2000 **`.h2k`** XML, evaluate **demo** compliance thresholds, and visualize buildings on Mapbox.

**Disclaimer:** Thresholds are for demonstration only. They do not constitute code compliance, permitting, or HOT2000 advice.

## Stack

Vite • React 19 • TypeScript • React Router • TanStack Query • Tailwind CSS v4 • Supabase (Auth + Postgres) • Mapbox GL (`react-map-gl`) • Vitest

## Quick start

```bash
pnpm install
cp .env.example .env.local
# fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MAPBOX_ACCESS_TOKEN
pnpm dev
```

### Supabase

1. Create a project and enable **Email** auth (disable email confirmation for frictionless local demos, or confirm each new user).
2. Run [`supabase/migrations/20260505120000_create_buildings.sql`](supabase/migrations/20260505120000_create_buildings.sql) in the SQL editor (or via Supabase CLI).
3. Paste project URL + anon key into `.env.local`.

### Mapbox

Create a public token at [mapbox.com](https://www.mapbox.com/) and set `VITE_MAPBOX_ACCESS_TOKEN`.

## `.h2k` parsing

Files must use the **`.h2k`** extension and contain UTF-8 XML.

| Source | Field | Notes |
|--------|--------|--------|
| Optional `<GreenSyncCompliance>` | `FullAddress`, `WallEffectiveRSI`, `WindowU`, `AirChangeRate`, `Latitude`, `Longitude` | Deterministic overlay for tests/demos. |
| `<BlowerTest airChangeRate="…">` | ACH @ 50 Pa | HOT2000 blower test node. |
| `<Wall><Construction><Type rValue="…">` … direct child only | Minimum wall RSI | Ignores nested window/door constructions. Uses **least** RSI across modeled walls (conservative demo). |
| `<Window><Construction><Type rValue="…">` … direct child | Fenestration U | `U = 1 / RSI_GLASS`; uses **worst** (maximum) `U`. |
| `ProgramIdentification` subtree | Friendly address (`Location`, `Region`, `Identification`) | See [`src/lib/parseH2k.ts`](src/lib/parseH2k.ts). |
| Fallback | Latitude / longitude | Defaults to Calgary centroid when coordinates are absent. |

Real HOT2000 releases may differ slightly—extend XPath-style helpers as you capture anonymized fixtures.

Fixture samples live in [`src/lib/__fixtures__/`](src/lib/__fixtures__/).

## Demo compliance thresholds

Handled in [`src/lib/compliance.ts`](src/lib/compliance.ts):

- Wall RSI minimum across assemblies **>= effective ~R-22 imperial mapping** \(22/5.678 ~ 3.87 RSI\).
- Worst glazing **U-factor <= 1.4 W/(m2*K)** derived from RSI (SI).
- Normalized airtightness **ACH@50 Pa <= 2.5**.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc` + production bundle |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |

## Troubleshooting auth

Supabase signup may return **no session** until email verification is toggled—see the toast on `/login`.

## Credits

Inspired by HOT2000 XML ergonomics mirrored in [`old_h2k_to_hpxml`](https://github.com/canmet-energy/old_h2k_to_hpxml) for tag naming references.
