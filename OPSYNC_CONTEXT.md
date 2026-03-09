# OPSYNC_CONTEXT.md
> Operational Sync Context File — Provides the AI with persistent project awareness.

---

## 🔷 PROJECT IDENTITY
- **Project Name:** OPSYNC
- **Version:** v0.1.0 (Pre-build / Architecture Phase)
- **Owner / Lead:** TBD
- **Last Updated:** 2026-03-08
- **Status:** Active — Layer-by-layer implementation in progress

---

## 🔷 PROJECT OVERVIEW
OPSYNC is a real estate wholesaling operations platform that manages the full deal lifecycle:
lead ingestion → cold calling → lead management → acquisition → disposition.
It combines AI-powered coaching and auditing, automated dialing, SMS/email outreach,
comps/MAO calculations, buyer matching, reporting, and billing — all in one unified platform
built for wholesale real estate teams and their agents.

---

## 🔷 TECH STACK

| Layer        | Technology                        | Notes                                      |
|--------------|-----------------------------------|--------------------------------------------|
| Frontend     | Next.js (Port 3000)               | /app, /dashboard, /agent, /admin routes    |
| Backend      | Node.js + Express + TypeScript    | Port 4000 — /api/v1/*                      |
| Validation   | Zod                               | All API input validation                   |
| Auth         | Supabase Auth (JWT)               | JWT middleware on API server               |
| Database     | Supabase (PostgreSQL)             | Primary data store                         |
| Storage      | Supabase Storage (S3)             | Photos, documents, reports                 |
| Realtime     | Supabase Realtime (WebSockets)    | Live dashboard updates                     |
| Edge Fns     | Supabase Edge Functions           | Lightweight serverless logic               |
| Queue        | Redis + BullMQ (Port 6379)        | 8 named queues (see below)                 |
| Automation   | n8n (Port 5678)                   | Workflows, webhooks, schedulers, triggers  |
| Reverse Proxy| Caddy                             | SSL termination, rate limiting, routing    |
| Hosting      | Hetzner CX41 or DigitalOcean VPS  | Docker                                     |
