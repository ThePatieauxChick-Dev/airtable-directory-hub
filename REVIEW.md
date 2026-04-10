# Repository Review (April 10, 2026)

## Executive summary

This project is a **Vite + React + TypeScript** front-end for an Airtable-backed business directory, with Supabase Edge Functions acting as a server-side proxy to Airtable APIs. The overall structure is clean and understandable, and the UX flow (directory browse + submit flow) is coherent.

The main opportunities are operational hardening (env/config hygiene), type-safety improvements, and developer-experience fixes (dependency lockfile/tooling mismatch currently blocks standard test install flows).

## What the app does

- Renders a searchable/filterable business directory in `src/pages/Index.tsx`.
- Fetches listing data through Supabase Edge Function `fetch-listings` via `supabase.functions.invoke(...)` from the client helper in `src/lib/airtable.ts`.
- Supports click/view analytics hooks (`src/hooks/use-listing-analytics.ts`) and listing cards/details components.
- Includes a Supabase Edge Function to submit listings to Airtable (`supabase/functions/submit-to-airtable/index.ts`).

## Architecture observations

### ✅ Strengths

1. **Good separation of concerns**
   - UI, data fetch helper, and edge function logic are separated cleanly.
2. **Server-side secret boundary**
   - Airtable API key retrieval happens inside edge functions (`Deno.env.get("AIRTABLE_API_KEY")`) instead of browser code.
3. **Reasonable client-side filtering UX**
   - Search/category/location filters are memoized in `Index.tsx`.
4. **Componentized UI layer**
   - Reusable `ui/*` components and business-specific cards/dialogs are split logically.

### ⚠️ Risks / technical debt

1. **Hard-coded Airtable IDs in edge functions**
   - `AIRTABLE_BASE_ID` and table IDs are committed directly in function files.
   - Recommendation: move these to environment variables (`AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`) for safer multi-env deployment.

2. **Type-safety gap at data boundary**
   - `parseRecord(record: any)` in `src/lib/airtable.ts` makes downstream assumptions without runtime schema validation.
   - Recommendation: validate responses (e.g., Zod schema in the edge function or client parser) to avoid malformed record crashes.

3. **Potential large payload behavior**
   - `fetch-listings` pulls *all* active records in a pagination loop then returns all at once.
   - Recommendation: add caching and/or pagination parameters if data set grows.

4. **Dependency/install reproducibility issue**
   - `npm ci` fails because `package-lock.json` is out of sync with `package.json`.
   - `bun install` fails in this environment due to 403 access to package registries/mirrors.
   - Recommendation: align lockfile with declared package manager; remove stale lockfile or regenerate consistently.

5. **README currently incomplete**
   - Existing README had only placeholder text, which slows onboarding.
   - Fixed in this review branch (see README updates).

## Immediate suggested next steps

1. Externalize Airtable base/table IDs to environment variables in both edge functions.
2. Add schema validation for Airtable records (or at least a typed guard) before mapping.
3. Decide on one package manager and commit a consistent lockfile strategy.
4. Add CI checks for `lint` + `test` (once install flow is stable).
5. Consider adding server-side pagination/caching for `fetch-listings` at scale.

## Review method

- Performed static code review of key client and edge-function files.
- Attempted local test/dependency checks, but install failed due to lock mismatch and package registry access constraints in this runtime.
