# BetMax — System Design Document

> **Version**: 1.0  
> **Last Updated**: 2026-02-14  
> **Project**: BetMax — Premium Sports Betting & Streaming Platform

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Next.js 16 App                       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐  │
│  │ Pages   │  │Components│  │ API Routes│  │  Lib   │  │
│  │ (app/)  │──│(comps/)  │  │ (api/)    │──│(lib/)  │  │
│  └─────────┘  └──────────┘  └───────────┘  └────────┘  │
│       │             │             │             │        │
│       └─────────────┴─────────────┴─────────────┘        │
│                          │                               │
│              ┌───────────┴───────────┐                   │
│              │   Scraper Engine      │                   │
│              │  (Puppeteer + Fetch)  │                   │
│              └───────────────────────┘                   │
│                          │                               │
│              ┌───────────┴───────────┐                   │
│              │  External Sources     │                   │
│              │  (19+ Streaming Sites)│                   │
│              └───────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **UI**: React 19, TailwindCSS 3.4, Radix UI
- **State**: TanStack Query (React Query v5)
- **Scraping**: Puppeteer, Puppeteer-Extra (stealth plugin)
- **Icons**: Lucide React
- **Theming**: next-themes
- **Animations**: animate.css, tailwindcss-animate

---

## 1. Homepage

> **Refs**: REQ-HP-1 through REQ-HP-8

### Component Structure
```
app/page.tsx (Home)
├── components/home/hero.tsx
├── components/home/live-stats-grid.tsx      (async, Suspense)
├── components/home/popular-sports.tsx       (static)
├── components/home/soccer-highlights.tsx    (async, Suspense)
├── components/home/featured-races.tsx       (async, Suspense)
├── components/home/cricket-highlights.tsx   (async, Suspense)
└── components/home/upcoming-matches.tsx     (async, Suspense)
```

### Design Decisions
- **Error Boundaries**: Every async section wrapped in `<ErrorBoundary>` + `<Suspense>` — prevents cascade failures (REQ-HP-8)
- **Skeleton Loading**: `SectionSkeleton` component renders placeholder cards during data fetch
- **Static-first**: Hero + PopularSports load instantly; data-dependent sections stream in

### Data Flow
1. Page renders → static sections paint immediately
2. Suspense boundaries trigger parallel server-side data fetches
3. Each section resolves independently → progressive rendering

---

## 2. Live Events

> **Refs**: REQ-LE-1 through REQ-LE-6

### Component Structure
```
app/live/page.tsx (LivePage)
└── components/live/live-dashboard.tsx (LiveDashboard)
```

### Design Decisions
- **Force-dynamic**: `export const dynamic = 'force-dynamic'` disables SSG/ISR for real-time accuracy (REQ-LE-5)
- **Aggregated Events**: Uses `getAggregatedEvents()` → runs all 19 scrapers in parallel via `Promise.allSettled()`
- **Client Hydration**: LiveDashboard receives SSR data as props, can re-fetch on client

### Data Model: ScrapedEvent
```typescript
interface ScrapedEvent {
  id: string;
  name: string;
  sport_key: string;
  sport_title: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  league?: string;
  url: string;
  source: string;
  images?: string[];
  streams?: StreamLink[];
}
```

---

## 3. Sports Betting

> **Refs**: REQ-SB-1 through REQ-SB-6

### Component Structure
```
app/betting/page.tsx (BettingPage)
└── components/odds/betting-dashboard.tsx (BettingDashboard)
```

### Design Decisions
- **Force-dynamic**: Same real-time caching strategy as Live Events
- **Betting Scraper**: `getBettingEvents()` fetches from `lib/scrapers/betting-scraper.ts`
- **Odds API Integration**: `lib/odds-api.ts` provides secondary odds source
- **Dashboard Pattern**: `initialEvents` prop allows SSR prefetch with client-side refresh

### API Contract
```
GET /api/betting
Response: { success: boolean, data: BettingEvent[], count: number }
```

---

## 4. Arbitrage Scanner

> **Refs**: REQ-AR-1 through REQ-AR-6

### Component Structure
```
app/arbitrage/page.tsx (ArbitragePage) — Client Component
```

### Design Decisions
- **Client-only**: `"use client"` — fully client-rendered due to interactive scan controls
- **Dual Scan Modes**: Auto (OddsPortal) vs Interactive (Oddspedia/CAPTCHA)
- **State Machine**: `loading` + `status` state controls button disablement (REQ-AR-6)

### Data Model: ArbitrageOpportunity
```typescript
interface ArbitrageOpportunity {
  id: string;
  event: string;
  sport: string;
  market: string;
  time: string;
  profit_percentage: number;
  source: string;
}
```

### API Contract
```
GET /api/scrape?source=oddsportal|oddspedia
Response: { success: boolean, data: ArbitrageOpportunity[], count: number }
```

---

## 5. Stats Hub

> **Refs**: REQ-ST-1 through REQ-ST-5

### Component Structure
```
app/stats/page.tsx (StatsPage)
└── components/data/stats-dashboard.tsx (StatsDashboard)
    └── components/data/ (supporting components)
```

### Design Decisions
- **Data Vault**: `lib/data/vault/` stores curated datasets (15+ vault files)
- **Dataset Orchestrator**: `lib/data/dataset-orchestrator.ts` manages data pipeline
- **Kaggle Importer**: `lib/data/kaggle-importer.ts` for external dataset ingestion
- **Intelligence Module**: `lib/data/intelligence.ts` for analytical insights
- **Simulated Names**: `lib/data/simulated-names.ts` for anonymized data display

### API Contract
```
GET /api/datasets
Response: { datasets: DatasetMeta[], total: number }
```

---

## 6. Streaming & Scrapers

> **Refs**: REQ-SC-1 through REQ-SC-11

### Architecture
```
lib/scrapers/
├── index.ts                 (aggregator + routing)
├── core/                    (base scraper classes)
├── implementations/         (19 scraper files)
│   ├── nfl-scraper.ts
│   ├── nba-scraper.ts
│   ├── soccer-scraper.ts
│   ├── cricket-scraper.ts
│   ├── streameast-scraper.ts
│   ├── sportsurge-scraper.ts
│   └── ... (13 more)
├── browser-manager.ts       (Puppeteer lifecycle)
├── scraper-utils.ts         (shared utilities)
├── betting-scraper.ts       (odds-specific scraper)
├── oddspedia-scraper.ts     (arbitrage source)
├── oddsportal-scraper.ts    (arbitrage source)
└── test-scrapers.ts         (validation utilities)
```

### Design Decisions
- **Parallel Execution**: `Promise.allSettled()` ensures no single failure blocks results (REQ-SC-2)
- **Browser Reuse**: `browser-manager.ts` pools Puppeteer instances (REQ-SC-8)
- **Smart Routing**: `getEventStreams(url)` routes to correct scraper by URL pattern
- **Stealth Plugin**: `puppeteer-extra-plugin-stealth` avoids bot detection

### Data Model: StreamLink
```typescript
interface StreamLink {
  streamer: string;
  link_name: string;
  url: string;
  mobile: 'yes' | 'no';
  quality: string;
  ads: number;
  language: string;
}
```

### Stream Context (Global State)
```
lib/stream-context.tsx (StreamProvider)
└── components/streams/global-stream-player.tsx (GlobalStreamPlayer)
```
- Context provides `activeStream`, `setStream()`, `clearStream()`
- GlobalStreamPlayer renders overlay on all pages
- Persists across route changes

---

## 7. Events & Sports Detail

> **Refs**: REQ-EV-1 through REQ-EV-4

### Component Structure
```
app/events/[eventId]/page.tsx   → Event detail
app/sports/[sportKey]/page.tsx  → Sport listing
```

### Design Decisions
- **Dynamic Routes**: Next.js `[param]` pattern for SEO-friendly URLs
- **Event Detail**: Fetches single event + streams by ID
- **Sport Listing**: Filters aggregated events by `sport_key`

---

## 8. Layout & Navigation

> **Refs**: REQ-LN-1 through REQ-LN-7

### Component Structure
```
app/layout.tsx (RootLayout)
├── components/layout/header.tsx
├── components/layout/footer.tsx
├── components/theme-toggle.tsx
├── app/error.tsx
├── app/not-found.tsx
└── app/loading.tsx
```

### Design Decisions
- **Theme**: `next-themes` with `suppressHydrationWarning` on `<html>` (REQ-LN-3)
- **Font**: Inter via `next/font/google` — optimized loading
- **Providers**: `app/providers.tsx` wraps children with TanStack QueryClientProvider + ThemeProvider
- **Stream Layer**: `StreamProvider` + `GlobalStreamPlayer` at root for persistent streaming

### UI Components (Radix-based)
```
components/ui/
├── badge.tsx, button.tsx, card.tsx
├── dialog.tsx, input.tsx, scroll-area.tsx
├── select.tsx, skeleton.tsx, table.tsx, tabs.tsx
```

---

## 9. Non-Functional Design

> **Refs**: REQ-NF-1 through REQ-NF-8

| Concern | Approach |
|---------|----------|
| Performance (REQ-NF-1) | Streaming SSR, Suspense boundaries, image optimization |
| SEO (REQ-NF-2) | Metadata exports on each page, semantic HTML |
| Error Resilience (REQ-NF-3) | ErrorBoundary component, try/catch in scrapers |
| Type Safety (REQ-NF-4) | Strict TypeScript, shared type definitions in `lib/types/` |
| Modularity (REQ-NF-5) | Independent scraper files, shared interfaces |
| Rate Limiting (REQ-NF-6) | ⚠ Not yet implemented — needed for production |
| Caching (REQ-NF-7) | ⚠ Partial — force-dynamic on live pages, no explicit cache layer |
| Accessibility (REQ-NF-8) | ⚠ Partial — Radix primitives provide baseline a11y |
