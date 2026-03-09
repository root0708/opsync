# OPSYNC: Roadmap to Live

How to go from architecture (where you are now) to a running, deployed platform. Follow in order; each phase builds on the previous.

---

## Prerequisites (do first)

| Item | Action |
|------|--------|
| **Supabase** | [supabase.com](https://supabase.com) — create project, note URL + anon key + service role key |
| **Node.js** | v20 LTS — [nodejs.org](https://nodejs.org) or `nvm install 20` |
| **Docker** | For Redis, n8n, Caddy, and eventual production — [docker.com](https://docker.com) |
| **Git** | Repo for OPSYNC (GitHub/GitLab) — push your existing `OPSYNC` folder |
| **Mojo** | API access for dialer when you reach Cold Calling layer |
| **VPS (later)** | Hetzner CX41 or DigitalOcean droplet — create when you start Phase 3 |

---

## Phase 1: Foundation (weeks 1–2)

**Goal:** Auth working, API and frontend talking to Supabase, one page live locally.

### 1.1 Monorepo and env

- In `OPSYNC/` create:
  - `apps/web/` — Next.js (port 3000)
  - `apps/api/` — Express + TypeScript (port 4000)
- Root `package.json`: use npm workspaces or pnpm workspaces.
- `.env.example` at root with:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `API_URL=http://localhost:4000`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Each app has its own `.env` (or reads from root). Never commit real keys.

### 1.2 Database and auth

- In Supabase Dashboard: enable Auth (Email + optional Magic Link or Google).
- Create initial tables, e.g.:
  - `profiles` (id, email, full_name, role, created_at) — sync from `auth.users` via trigger or Edge Function.
  - `organizations` and `organization_members` if you need multi-tenant from day one.
- Apply RLS policies so users only see their org’s data.
- Backend: add JWT middleware (validate Supabase JWT on `Authorization: Bearer <token>` for `/api/v1/*`).

### 1.3 API and frontend shell

- **API:** Express + TypeScript, `/api/v1/health`, `/api/v1/me` (return current user from JWT). Use Zod for any body/query validation.
- **Web:** Next.js App Router, `/app` (login/signup), `/dashboard` (protected, simple “Dashboard” placeholder).
- Use Supabase client in Next.js for sign-in/sign-up; call your API with the session token for `/api/v1/*`.
- Run locally: `npm run dev` in `apps/web`, `npm run dev` in `apps/api` — login and “Dashboard” work.

### 1.4 Redis + BullMQ (optional in Phase 1)

- `docker run -d -p 6379:6379 redis:7-alpine`
- In API, add BullMQ and create one queue (e.g. `email` or `imports`). Process a trivial job so you know the pipeline works. You’ll add the “8 named queues” as you build each layer.

**Checkpoint:** You can sign up, log in, see a dashboard, and call `/api/v1/me`. DB and auth are the base for everything else.

---

## Phase 2: Layers in order (weeks 3–12+)

Build one layer at a time; each layer adds DB tables, API routes, and UI.

| Order | Layer | What to build |
|-------|--------|----------------|
| 1 | **Data** | CSV upload endpoint, DNC check (table + job), duplicate check, phone/skip-trace fields, “list ready” status. Queue: `data-import`. |
| 2 | **Cold Calling** | Mojo API client, 10-dial max and 24h redial logic, call status enum and storage. UI: simple list of leads with status. Queues: `dialer`, `redial`. |
| 3 | **Lead Manager** | Opportunity view, comps/MAO fields, lead status enum, auto-dial frequency per status. API + dashboard list/detail. |
| 4 | **SMS/Email** | Optional: Twilio/SendGrid (or similar) + webhook handler, same status tracking, store replies. Queue: `sms`, `email`. AI reply parsing can come later. |
| 5 | **Walkthrough** | Mobile-friendly form (photo upload to Supabase Storage), condition report, link to lead. API: create walkthrough, attach to lead. |
| 6 | **Acquisition** | Comps view, MAO calculator, offer template, acquisition status enum. API + UI for moving lead to acquisition and updating status. |
| 7 | **Disposition** | Buyers list, matching logic, “blast” template and send. Queues: `disposition`, `notifications`. |
| 8 | **AI** | Post-call audit (transcript → score), KPI metrics, comps calc, buyer matching. Start with one feature (e.g. post-call score) and add others. |
| 9 | **Communication** | Internal channels (e.g. Supabase Realtime or simple threads table), DMs, bot webhooks from n8n. Calendar sync (e.g. Google Calendar API) if needed. |
| 10 | **Reporting** | Dashboard widgets (from existing tables), Excel export (e.g. `xlsx`), PDF (e.g. Puppeteer or report API). n8n cron for EOD/EOW/EOM reports. |
| 11 | **Billing** | Cost-per-client table, subscription and agent pay/bonus fields, invoice generation (template + PDF). Can be minimal (spreadsheet-style) at first. |

**n8n:** Use for EOD/EOW/EOM triggers, webhooks into your API, and “auto templates on status change” (n8n calls API when status changes). Add workflows as you build each layer.

**Checkpoint:** All layers have at least one flow working end-to-end (e.g. upload list → DNC → dial → status → lead manager → acquisition → disposition).

---

## Phase 3: Deployment (weeks 2–3, can overlap with Phase 2)

**Goal:** API and frontend running on your VPS behind Caddy, with SSL.

### 3.1 Server and Docker

- Create VPS (Hetzner CX41 or DigitalOcean). SSH in, install Docker (and Docker Compose).
- In repo add `docker-compose.yml` (and optional `Dockerfile` for API and web):
  - **api** — build from `apps/api`, port 4000 internal.
  - **web** — build from `apps/web` (Next.js standalone), port 3000 internal.
  - **redis** — image `redis:7-alpine`, port 6379.
  - **n8n** — image `n8nio/n8n`, port 5678.
  - **caddy** — image `caddy:alpine`, ports 80/443, mount Caddyfile.

### 3.2 Caddy

- Caddyfile: reverse proxy to `web:3000` (/) and `api:4000` (/api). Rate limiting if desired.
- Use Caddy’s automatic HTTPS (Let’s Encrypt) once DNS points to the server.

### 3.3 Environment and secrets

- On server, set env vars (or use a `.env` file not in repo): Supabase keys, `API_URL` (your public API URL), `NEXT_PUBLIC_APP_URL` (your public app URL), Redis URL, n8n credentials, Mojo API key, etc.
- Never put production keys in Git.

### 3.4 DNS and SSL

- Point your domain (e.g. `app.opsy nc.com`, `api.opsy nc.com`) to the VPS IP.
- Restart Caddy; it will obtain certificates. Ensure `https` works for both app and API.

### 3.5 Supabase in production

- Use the same Supabase project or a separate “production” project. Point API and web to the correct Supabase URL and keys. Configure Auth redirect URLs to your live app URL.

**Checkpoint:** You can open `https://yourdomain.com`, log in, and use the app; API calls go to `https://api.yourdomain.com` (or same domain under `/api`).

---

## Phase 4: Go live

- **Monitoring:** Simple health checks (e.g. `/api/v1/health`) and uptime monitor (e.g. UptimeRobot). Optionally add error tracking (e.g. Sentry).
- **Backups:** Supabase has backups; also consider pg_dump cron. Back up Redis if you store critical state in queues.
- **Launch checklist:** Auth redirect URLs updated, rate limits and Caddy in place, env verified, at least one user can complete one full flow (e.g. upload → dial → status update).
- **Iterate:** Add the “8 named queues” explicitly, refine n8n workflows, and add AI/communication/reporting/billing features based on usage.

---

## Quick reference: “What do I do Monday?”

1. Create Supabase project and get keys.
2. Scaffold `apps/web` (Next.js) and `apps/api` (Express + TS) in `OPSYNC/`.
3. Add Supabase Auth + one `profiles` table and JWT middleware on the API.
4. Build login + dashboard and `/api/v1/me`. You’re “live” locally.
5. Then add Data layer (CSV upload + DNC), then Cold Calling (Mojo), and so on.
6. When a layer is usable, add Docker + Caddy and deploy to VPS; then keep building the next layer.

Use **[OPSYNC-Platform-Map.md](OPSYNC-Platform-Map.md)** for what each layer must do and **[OPSYNC_CONTEXT.md](../OPSYNC_CONTEXT.md)** for stack and ports.
