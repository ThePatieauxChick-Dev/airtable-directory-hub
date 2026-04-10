# Airtable Directory Hub

A React + TypeScript directory web app backed by Airtable data, with Supabase Edge Functions used as the secure server-side integration layer.

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui
- **Data access:** Supabase Edge Functions
- **Source of truth:** Airtable base/table

## Project structure

- `src/` — front-end app (pages, components, hooks, utilities)
- `supabase/functions/fetch-listings/` — server-side Airtable read proxy
- `supabase/functions/submit-to-airtable/` — server-side Airtable write/submit endpoint
- `supabase/migrations/` — Supabase SQL migrations

## Local development

> Note: In this environment, package installation may fail due to registry access restrictions.

Typical workflow:

```bash
npm install
npm run dev
```

## Environment variables

Required for edge functions:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_ID`

## Repository review

See `REVIEW.md` for a structured architecture/risk review completed on **April 10, 2026**.


### If dependency install fails with HTTP 403

Some CI/sandbox environments inject proxy variables that can break npm registry access. Use the helper script to install without inherited proxy env vars:

```bash
npm run install:deps
```

And run dev in the same clean environment:

```bash
npm run dev:clean-env
```
