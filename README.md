# Campkin Motor & Warehouse

Marketing site + lightweight CMS for a Hertfordshire-based warehouse sharing, vehicle sales, and repair business run by Phil Campkin. Built with the Next.js App Router, Tailwind CSS v4, and a file-backed JSON datastore so non-technical admins can edit content without 3rd-party services.

## Features

- **Public site** focused on a single-owner operation: Homepage, Sublet listings, Available cars, and a Contact page with protected phone reveal + spam-resistant form.
- **Theme designer + hero controls** so you can swap brand colours, hero imagery, and CTAs without touching code; updates push through CSS variables across the site.
- **Admin dashboard** protected by a passcode to edit hero copy, contact info, unit availability, service menu, testimonials, FAQs, performance metrics, and vehicle listings with inline validation and dirty-state detection.
- **Media library + compression** so admins can drag in hero/store imagery, let the server auto-generate 2K WebP assets via Sharp, and copy CDN-friendly URLs straight into any field.
- **Lightweight site map** with four public pages: homepage, Sublet listings, Available cars, and Contact (protected phone reveal + spam-resistant form).
- **Data API** (`/api/cms`) that reads/writes `data/cms.json` using Zod validation to keep the JSON structure consistent.
- **Responsive UI** with persistent navigation/header, map embed, performance strip, and Tailwind design tokens defined via the new v4 workflow (tablet + mobile first).
- **JSON snapshot tools** inside `/admin` to copy/share the current content seed for other environments.
- **Lead capture** endpoints (`/api/leads`) + warehouse/vehicle enquiry forms that drop submissions into `data/leads.json` for later ingestion into a CRM.
- **Compliance workspace** baked into the admin dashboard so Phil can run DVLA/DVSA lookups, attach proof packs, and save audit snapshots without leaving the CMS.

## Tech stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4 + CSS variables for theming
- Zod for runtime validation
- File-system CMS (`data/cms.json`) for quick prototyping

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site or `http://localhost:3000/admin` to open the dashboard. Changes you publish in the admin panel immediately update `data/cms.json`, so commit that file if you want to keep edits.

### Site configuration

- `NEXT_PUBLIC_SITE_URL` – canonical origin used for metadata, sitemap, and robots (defaults to `https://campkinmotors.co.uk`).
- `NEXT_PUBLIC_OG_IMAGE` – fallback Open Graph/JSON-LD image.
- Both GOV.UK lookups require server-side keys (see below) and should **never** be exposed on the client.
- `TFL_APP_KEY` (+ optional `TFL_APP_ID`) – register on the TfL Unified API portal to enable live VehicleReg compliance checks.
- `CAZ_API_KEY` – JAQU/DEFRA key for the Drive Clean Air Zone service (`CAZ_API_BASE` defaults to the production endpoint).
- `MARKETCHECK_API_KEY` – optional market comparables feed; without it the buying tool falls back to current in-house stock data.
- `ADMIN_PASSCODE_HASH` – preferred way to store the admin passcode (hex sha256 digest). Falls back to `ADMIN_PASSCODE` only if the hash is missing.
- `ADMIN_SESSION_SECRET` – shared HMAC secret for signing admin cookies; generate with `openssl rand -hex 32`.
- `ADMIN_RATE_LIMIT` / `ADMIN_RATE_WINDOW_MS` – optional throttling knobs for `/api/auth` (defaults: `10` attempts per `600000` ms).

### Admin access

1. Generate a strong passphrase, hash it with `echo -n "your-passcode" | openssl dgst -sha256`, and set the hex digest as `ADMIN_PASSCODE_HASH`. (The legacy `ADMIN_PASSCODE` env still works for local dev but is no longer recommended.)
2. Create a long random `ADMIN_SESSION_SECRET` (`openssl rand -hex 32`) so session cookies can be signed securely.
3. Optional: tweak `ADMIN_RATE_LIMIT` / `ADMIN_RATE_WINDOW_MS` to raise or lower the per-IP attempt budget (defaults: 10 attempts / 10 minutes).

`/login` now issues a signed, HttpOnly, `SameSite=strict` cookie that the middleware verifies before allowing `/admin` or write access to `/api/cms`. Log out from the dashboard to revoke the cookie immediately.

Vehicle lookup requires two GOV.UK trade keys:

```env
DVLA_VES_API_KEY=your-dvla-key
DVSA_MOT_API_KEY=your-dvsa-key
```

You can request both keys from DVLA/DVSA (free for accredited traders) via the GOV.UK developer portal.

### Admin quality-of-life

- The publish button is disabled until changes differ from the last saved snapshot, so you always know whether drafts are pending.
- Use the **Copy JSON** button at the bottom of `/admin` to hand content to colleagues or seed staging data.
- Theme controls (colours, hero background, overlay) feed directly into CSS variables so front-end styles update instantly.

## Editing content manually

All seed content (hero copy, warehouse sections, services, vehicles, testimonials, FAQs) lives in `data/cms.json`. The `src/lib/dataStore.ts` helper centralizes reading/writing, so you can swap it for a real database later without touching the UI.

### Lead management

- `/api/leads` accepts public POSTs from the warehouse + vehicle enquiry forms and persists them to `data/leads.json`.
- `/admin` now includes a “Inbound enquiries” table so managers can sort, refresh, and export the CSV straight from the browser.
- To move into production, point `leadStore` at your CRM or send webhooks from `/api/leads`.

### Vehicle compliance checks

- `/api/vehicle` proxies DVLA (road tax / spec) + DVSA (MOT history) responses server-side so your API keys stay private, then runs the VED forecaster (with the £410 “expensive car” supplement) using the list price you supply.
- Live TfL ULEZ and DEFRA/JAQU Clean Air Zone verdicts are requested whenever the relevant API keys are present, cached per VRM for 12 hours to stay within rate limits, and fall back to Euro-standard heuristics if the services are offline.
- The **Certification** tab inside `/admin` exposes the modern card-based UI with MOT timelines, advisory badges, compliance proofs, and the extended widgets so sales + workshop staff can export everything to a worksheet before onboarding stock.
- Each vehicle card inside `/admin` ships with a “Compliance” widget so you can enter VRM + list price, run the GOV.UK-backed lookup without leaving the CMS, attach finance/retrofit proof documents, and archive timestamped snapshots for audit trails.

## Testing & linting

- `npm run lint` – ESLint (Next config)
- `npm run lint:strict` – blocks on any warnings (used for CI “green builds”)
- `npm run build` – ensures the App Router compiles before deployment
- `npm run audit` – runs `npm audit` in production mode for a quick dependency health check

## Docker

Build and run using the included multi-stage image (data lives in `/app/data`, so mount a volume if you want changes to persist):

```bash
docker build -t campkin .
docker run -p 3000:3000 -v $(pwd)/data:/app/data --env ADMIN_PASSCODE=campkin campkin
```

> Tip: committing `data/cms.json` and `data/leads.json` keeps the prototype state in sync between containers/environments.

### docker-compose

For a one-liner local environment:

```bash
cp .env.example .env
docker compose up --build
```

The compose file binds `./data` into the container so edits survive restarts.

## Next steps / ideas

1. Add authentication (e.g., NextAuth or Clerk) before exposing the admin route publicly.
2. Persist rich media by swapping the file-based store for a database or headless CMS.
3. Integrate finance calculators, PX valuations, or lead forms to mirror Autotrader UX even closer.
