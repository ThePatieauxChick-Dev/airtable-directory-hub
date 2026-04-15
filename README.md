# The Patieaux Business Directory

A curated, luxury business directory built for **The Patieaux Chick** brand. Business owners apply to be featured, submissions are reviewed in Airtable, and approved ("Active") listings are displayed publicly in an elegant, searchable directory.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Directory Page](#directory-page)
  - [Submit Business Page](#submit-business-page)
  - [API Server](#api-server)
  - [Airtable Data Model](#airtable-data-model)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## Overview

The Patieaux Business Directory is a full-stack web application that allows:

- **Visitors** to browse a curated, filterable directory of approved businesses
- **Business owners** to apply for a listing by submitting a form with their details and a photo
- **Admins** to review submissions in Airtable and approve them by setting the record's `Status` field to `"Active"`

All listing data lives in **Airtable**. The Express server acts as a secure proxy — API keys are never exposed to the browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| Data fetching | TanStack Query (React Query v5) |
| Routing | React Router v6 |
| Backend server | Node.js + Express 5 |
| File uploads | Multer (memory storage) |
| Data source | Airtable REST API |
| Runtime | Node.js 20 |

---

## Project Structure

```
.
├── server/
│   └── index.ts                   # Express API server — Airtable proxy + file upload handler
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui component library (Button, Badge, Dialog, etc.)
│   │   ├── DirectoryHeader.tsx
│   │   ├── DirectorySidebar.tsx   # Search input + category/location filters
│   │   ├── ListingCard.tsx        # Individual business card in the grid
│   │   ├── ListingDetailDialog.tsx # Full detail modal opened on card click
│   │   └── NavLink.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Responsive breakpoint hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   ├── airtable.ts            # Airtable record parser + fetchListings() function
│   │   └── utils.ts               # Tailwind class merge utility
│   ├── pages/
│   │   ├── Index.tsx              # Main directory page with search/filter/grid
│   │   ├── SubmitBusiness.tsx     # Application form for new business listings
│   │   └── NotFound.tsx           # 404 page
│   ├── App.tsx                    # Root component — routing and global providers
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles, CSS custom properties (theme tokens)
├── public/
│   ├── favicon.ico.png
│   ├── placeholder.svg
│   └── robots.txt
├── scripts/
│   └── seed-dummy-listings.ts     # Developer utility to seed test data into Airtable
├── uploads/                       # Temporary storage for submitted business photos
├── index.html                     # Vite HTML entry point
├── vite.config.ts                 # Vite config — dev server, proxy rules, path aliases
├── tailwind.config.ts             # Tailwind theme — luxury fonts, brand colors, animations
├── tsconfig.json                  # TypeScript config (root)
├── tsconfig.app.json              # TypeScript config (frontend source)
├── tsconfig.node.json             # TypeScript config (server + config files)
└── package.json                   # Dependencies and npm scripts
```

---

## How It Works

### Directory Page

`src/pages/Index.tsx` is the homepage. On load, it calls `fetchListings()` via React Query. The result is cached and filtered entirely client-side — no additional API calls are made when the user searches or changes filters.

**Filtering logic (all client-side):**

1. **Category filter** — exact match on the listing's `category` field
2. **Location filter** — normalized substring match on `cityAndState`
3. **Search query** — matches against `businessName`, `category`, `cityAndState`, and `description`

Clicking any listing card opens `ListingDetailDialog.tsx`, a full-screen modal with contact details, bio, website, and social links.

### Submit Business Page

`src/pages/SubmitBusiness.tsx` is the application form at `/submit`. It collects:

| Field | Required | Notes |
|---|---|---|
| Full Name | Yes | |
| Email | Yes | Validated with regex |
| City & State | Yes | |
| Country | Yes | Dropdown with 35+ countries |
| Short Bio | Yes | Displayed publicly in the directory |
| Business Category | Yes | Food & Beverage / Outdoor Living / Wellness / Other |
| Business Name | Yes | |
| What Do You Offer | Yes | Shown in detail modal |
| Photo | No | Up to 8 MB, images only |
| Website or Booking Link | No | |
| Social Media Link | No | Instagram preferred |
| Personal Category | Yes | Wellness / Service Provider / Business Owner / Creative / etc. |
| Phone | No | |

On successful submission the form POSTs `multipart/form-data` to `/api/submit-listing`. The server saves the photo to the `uploads/` directory (so Airtable can fetch it via public URL), creates a record in Airtable with `Status: "Pending"`, and on success redirects the user to `http://bit.ly/thepatieauxbusinessguide`.

All four acknowledgement checkboxes must be ticked before the form can be submitted.

### API Server

`server/index.ts` is a standalone Express application that runs alongside the Vite dev server in development. In production it serves the compiled frontend as static files from `dist/`.

**Endpoints:**

#### `GET /api/listings`

Fetches all records from Airtable where `{Status} = "Active"`. Handles Airtable's pagination automatically (follows the `offset` cursor until all records are retrieved). Returns:

```json
{
  "records": [ ...airtable record objects... ]
}
```

The frontend's `src/lib/airtable.ts` maps these raw records into strongly-typed `Listing` objects using a flexible `pickField()` helper that matches field names case-insensitively. This makes the parser resilient to minor Airtable column name variations.

#### `POST /api/submit-listing`

Accepts `multipart/form-data`. Validates required fields, saves the uploaded photo to `uploads/` with a UUID filename, then POSTs a new record to Airtable with `Status: "Pending"`. The `personalCategory` value is saved to the `"Niche"` field in a separate PATCH call (non-fatal if the field doesn't exist in Airtable).

File upload limits:
- Max size: **8 MB**
- Allowed types: **images only** (`image/*`)

#### `GET /uploads/:filename`

Serves uploaded photos as static files so Airtable can fetch them via public URL during submission.

### Airtable Data Model

The app reads from and writes to a single Airtable table. The field names the app expects (matched case-insensitively):

| Airtable Field Name | Type | Notes |
|---|---|---|
| `Status` | Single select | Only `"Active"` records appear in the directory. New submissions are set to `"Pending"`. |
| `Business Name` | Text | Listing title on the card |
| `Full Name` | Text | Owner name shown below the business name |
| `Photo` | Attachment | Business/owner photo displayed on the card |
| `Category` | Multiple select | Filter chip and badge on the card |
| `City and State` | Text | Location shown on the card |
| `Country` | Text | Shown alongside city/state |
| `Short Bio` | Long text | Description shown on the card and in the detail modal |
| `What Do You Offer` | Long text | Shown in the detail modal |
| `Email` | Email | Contact info in the detail modal |
| `Phone` | Phone | Contact info in the detail modal |
| `Website or Booking Link` | URL | Clickable link on the card and in the modal |
| `Social Media Link (Instagram Preferred)` | Text | Instagram link on the card |
| `Other Social Media` | Text | Additional social links in the modal |
| `Niche` | Text | Set to the submitter's personal category on submission |

---

## Environment Variables

The server reads three secrets at runtime. **Never put these values directly in your code or commit them to version control.**

| Variable | Description | Where to find it |
|---|---|---|
| `AIRTABLE_API_KEY` | Personal access token for Airtable | airtable.com → Account → Developer Hub → Personal access tokens. Must have `data.records:read` and `data.records:write` scopes on your base. Token starts with `pat`. |
| `AIRTABLE_BASE_ID` | The ID of your Airtable base | Open your base in Airtable. The URL is `airtable.com/appXXXXXXXX/...` — the `appXXXXXXXX` segment is the Base ID. |
| `AIRTABLE_TABLE_ID` | The ID of the table inside your base | The URL is `airtable.com/appXXXXXXXX/tblXXXXXXXX/...` — the `tblXXXXXXXX` segment is the Table ID. |

---

## Local Development Setup

### Prerequisites

- **Node.js 20 or higher** — download at [nodejs.org](https://nodejs.org)
- **npm 10 or higher** — bundled with Node.js
- An **Airtable account** with a base and table configured (see [Airtable Data Model](#airtable-data-model) above for the expected field names)

### Steps

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd <repo-folder>
```

**2. Install dependencies**

```bash
npm install
```

**3. Create a `.env` file**

Create a file named `.env` in the root of the project and add your Airtable credentials:

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_ID=tblXXXXXXXXXXXXXX
```

Replace each value with your real credentials. The `.env` file is listed in `.gitignore` and will not be committed.

**4. Start the development server**

```bash
npm run dev
```

This starts two processes concurrently:

- **Vite dev server** on `http://localhost:5000` — the React frontend with hot module replacement
- **Express API server** on `http://localhost:3001` — the secure Airtable proxy

Vite is configured to proxy all `/api` requests to the Express server automatically, so you only need to open `http://localhost:5000` in your browser.

**5. (Optional) Seed your Airtable table with test data**

If your Airtable table is empty and you want some sample listings to appear immediately:

```bash
npm run seed
```

This creates 4 dummy `"Active"` listings in your table (a haircare studio, a catering business, a photography company, and a womenswear brand). You can delete them from Airtable at any time.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start Vite + Express concurrently for local development |
| `build` | `npm run build` | Compile TypeScript and bundle the React frontend to `dist/` |
| `start` | `npm start` | Run only the Express server (serves the built `dist/` as static files — production mode) |
| `seed` | `npm run seed` | Insert 4 dummy Active listings into your Airtable table |
| `lint` | `npm run lint` | Run ESLint across all source files |
| `test` | `npm test` | Run the Vitest test suite once |
| `test:watch` | `npm run test:watch` | Run Vitest in interactive watch mode |

> **Note on production:** `npm run build` compiles the frontend, then `npm start` runs Express which serves those compiled files as static HTML/CSS/JS — there is no separate Vite process in production.

---

## Deployment

The app is deployed on **Replit Autoscale**.

- **Build command:** `npm run build` — compiles the React frontend into `dist/`
- **Run command:** `node ./dist/index.cjs` — starts the Express server which serves the API and the compiled frontend

**Required secrets in production:**

Set `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_ID` in Replit's Secrets tab (the lock icon in the left sidebar). They are injected automatically as environment variables at runtime and are never exposed in the source code or browser.
