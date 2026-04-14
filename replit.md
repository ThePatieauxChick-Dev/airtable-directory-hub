# The Patieaux Business Directory

A curated business directory for The Patieaux Chick community. Users can browse, filter, and explore featured vendors, with business owners able to apply via an embedded Airtable form.

## Architecture

- **Frontend**: React 18 + Vite + TypeScript, styled with Tailwind CSS and Shadcn UI (Radix UI)
- **Backend**: Express server (`server/index.ts`) running on port 3001
- **Database**: PostgreSQL (Replit-managed) via Drizzle ORM — used for analytics tracking
- **Data source**: Airtable — primary CMS/database for business listings (fetched server-side)
- **Routing**: React Router DOM v6
- **Data fetching**: TanStack Query (React Query)

## Dev Setup

- `npm run dev` — starts both Vite (port 5000) and the Express API server (port 3001) concurrently
- Vite proxies all `/api/*` requests to the Express server
- `npm run db:push` — push schema changes to the database

## Key Files

- `server/index.ts` — Express API server with two routes:
  - `GET /api/listings` — proxies Airtable API, returns active listings
  - `POST /api/analytics` — records view/click events to PostgreSQL
- `shared/schema.ts` — Drizzle ORM schema (listing_analytics, business_submissions)
- `server/db.ts` — PostgreSQL connection pool
- `src/lib/airtable.ts` — fetches listings from `/api/listings`, parses Airtable records into typed `Listing` objects
- `src/hooks/use-listing-analytics.ts` — tracks card views (Intersection Observer) and link clicks via `/api/analytics`
- `src/pages/Index.tsx` — main directory page with search, category, and location filters
- `src/pages/SubmitBusiness.tsx` — embedded Airtable form for business applications
- `drizzle.config.ts` — Drizzle Kit configuration

## Required Secrets

- `AIRTABLE_API_KEY` — Airtable personal access token
- `AIRTABLE_BASE_ID` — Airtable base ID (starts with `app…`)
- `AIRTABLE_TABLE_ID` — Airtable table ID or name for listings

## Deployment

- Build: `npm run build` (Vite + TypeScript server build)
- Start: `node dist-server/index.js` (serves both API and built frontend static files)
