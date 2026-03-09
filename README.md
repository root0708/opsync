# OPSYNC Platform

Real estate wholesaling operations platform: lead ingestion → cold calling → lead management → acquisition → disposition, with AI, reporting, and billing.

**For AI / persistent context:** see **[OPSYNC_CONTEXT.md](OPSYNC_CONTEXT.md)** (identity, overview, tech stack).

## Architecture

The system is organized into **11 layers**. See the full map:

**[OPSYNC Platform Map](docs/OPSYNC-Platform-Map.md)**

| Layer | Purpose |
|-------|--------|
| [Data](docs/OPSYNC-Platform-Map.md#data-layer) | PropStream/CSV → DNC → duplicates → phone/skip trace → list ready |
| [Cold Calling](docs/OPSYNC-Platform-Map.md#cold-calling-layer) | Mojo dialer, 10 max, 24h redial, status tracking |
| [SMS/Email](docs/OPSYNC-Platform-Map.md#sms--email-layer-optional-parallel) | Optional parallel channel, AI replies, warm lead routing |
| [Lead Manager](docs/OPSYNC-Platform-Map.md#lead-manager-layer) | Opportunities, comps/MAO, status pipeline, auto-dial |
| [Walkthrough](docs/OPSYNC-Platform-Map.md#walkthrough-layer) | Mobile form, photos, condition report → lead |
| [Acquisition](docs/OPSYNC-Platform-Map.md#acquisition-layer) | Comps, MAO calc, offer template, deal statuses |
| [Disposition](docs/OPSYNC-Platform-Map.md#disposition-layer) | Buyer matching, blast to buyers |
| [AI](docs/OPSYNC-Platform-Map.md#ai-layer) | Call coaching, audits, KPIs, comps, matching, reports |
| [Communication](docs/OPSYNC-Platform-Map.md#communication-layer) | Internal channels, DMs, bots, templates, calendar |
| [Reporting](docs/OPSYNC-Platform-Map.md#reporting-layer) | Dashboard, Excel/PDF, EOD/EOW/EOM |
| [Billing](docs/OPSYNC-Platform-Map.md#billing-layer) | Per-client cost, subscriptions, agent pay, invoices |

## Project structure

```
OPSYNC/
├── README.md                 # This file
├── OPSYNC_CONTEXT.md         # AI context: identity, overview, tech stack
├── package.json              # Monorepo root (workspaces)
├── .env.example              # Copy to .env and fill in Supabase keys
├── apps/
│   ├── api/                  # Express + TS (port 4000)
│   └── web/                  # Next.js (port 3000)
├── docs/
│   ├── OPSYNC-Platform-Map.md
│   └── ROADMAP-TO-LIVE.md
├── src/
├── config/
└── tests/
```

## Run locally

1. Copy `.env.example` to `.env` and fill in Supabase URL + anon key + service role key.
2. Copy the same Supabase values as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for the web app).
3. `npm install` (at root).
4. `npm run dev` — starts API (4000) and web (3000).
5. Open http://localhost:3000 → sign up → dashboard.

## Getting started

1. **[Roadmap to live](docs/ROADMAP-TO-LIVE.md)** — Prerequisites, Phase 1 (foundation), Phase 2 (layers in order), Phase 3 (deploy), Phase 4 (go live).
2. Read [docs/OPSYNC-Platform-Map.md](docs/OPSYNC-Platform-Map.md) for the full architecture.
3. Implement layer by layer (Data → Cold Calling → Lead Manager → …) as in the roadmap.

## Tech stack

| Component   | Choice |
|------------|--------|
| Frontend   | Next.js (port 3000) — /app, /dashboard, /agent, /admin |
| Backend    | Node.js + Express + TypeScript (port 4000, /api/v1/*) |
| Validation | Zod |
| Auth / DB / Storage / Realtime | Supabase (Auth, PostgreSQL, S3, WebSockets) |
| Queue      | Redis + BullMQ (port 6379) |
| Automation | n8n (port 5678) |
| Proxy      | Caddy |
| Hosting    | Hetzner CX41 or DigitalOcean VPS (Docker) |

Full details: [OPSYNC_CONTEXT.md](OPSYNC_CONTEXT.md).
