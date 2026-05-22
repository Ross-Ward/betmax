# BetMax — Requirements Document

> **Version**: 1.0  
> **Last Updated**: 2026-02-14  
> **Project**: BetMax — Premium Sports Betting & Streaming Platform

---

## Table of Contents
- [1. Homepage](#1-homepage)
- [2. Live Events](#2-live-events)
- [3. Sports Betting](#3-sports-betting)
- [4. Arbitrage Scanner](#4-arbitrage-scanner)
- [5. Stats Hub](#5-stats-hub)
- [6. Streaming & Scrapers](#6-streaming--scrapers)
- [7. Events & Sports Detail](#7-events--sports-detail)
- [8. Layout & Navigation](#8-layout--navigation)
- [9. Non-Functional Requirements](#9-non-functional-requirements)

---

## 1. Homepage

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-HP-1 | Display a hero section with branding and call-to-action | Hero renders above the fold with title, subtitle, and CTA button | ✅ 4 |
| REQ-HP-2 | Show live stats grid with real-time data | LiveStatsGrid component fetches and displays current event counts | ✅ 4 |
| REQ-HP-3 | Display popular sports categories with navigation | PopularSports renders sport cards that link to `/sports/[sportKey]` | ✅ 4 |
| REQ-HP-4 | Show soccer highlights section | SoccerHighlights displays top soccer matches from scrapers | ✅ 4 |
| REQ-HP-5 | Show featured races section (horse/greyhound) | FeaturedRaces renders upcoming race events | ✅ 4 |
| REQ-HP-6 | Show cricket highlights section | CricketHighlights displays live/upcoming cricket matches | ✅ 4 |
| REQ-HP-7 | Show upcoming matches across all sports | UpcomingMatches displays next events with timestamps | ✅ 4 |
| REQ-HP-8 | Each section must have error boundaries and suspense loading | Sections degrade gracefully on failure; skeletons show during load | ✅ 4 |

### Business Rules
- Homepage must load within 3 seconds on average connection
- Failed sections must not crash the entire page
- Sports data should auto-refresh periodically

---

## 2. Live Events

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-LE-1 | Display real-time live events from multiple scrapers | LivePage calls `getAggregatedEvents()` and renders results | ⬜ 3 |
| REQ-LE-2 | Filter events by sport type | User can filter displayed events by sport category | ⬜ 2 |
| REQ-LE-3 | Show event details (teams, time, league) | Each event card displays team names, start time, and league | ⬜ 3 |
| REQ-LE-4 | Provide stream links for live events | Clicking an event reveals available stream sources | ⬜ 3 |
| REQ-LE-5 | Support force-dynamic rendering (no cache) | Page uses `export const dynamic = 'force-dynamic'` | ⬜ 4 |
| REQ-LE-6 | Auto-refresh live event data | Events update periodically without manual page refresh | ⬜ 2 |

### Business Rules
- Caching must be disabled for real-time accuracy
- Events should display timezone-aware timestamps
- Failed scrapers must not prevent other events from showing

---

## 3. Sports Betting

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-SB-1 | Display betting events with odds from multiple bookmakers | BettingDashboard renders events with comparative odds | ⬜ 3 |
| REQ-SB-2 | Fetch betting data via `getBettingEvents()` | API scrapes odds data and returns structured JSON | ⬜ 3 |
| REQ-SB-3 | Compare odds across bookmakers | User can see side-by-side odds from different sources | ⬜ 2 |
| REQ-SB-4 | Show loading state during odds scraping | Animated spinner with status message during fetch | ⬜ 3 |
| REQ-SB-5 | Filter betting events by sport | Users can narrow results by sport category | ⬜ 2 |
| REQ-SB-6 | Display odds in decimal and fractional formats | User can toggle between odds display formats | ⬜ 1 |

### Business Rules
- Odds must display the bookmaker source
- Stale odds (>30 min) should be marked as potentially outdated
- All odds data is for informational purposes only

---

## 4. Arbitrage Scanner

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-AR-1 | Scan OddsPortal for arbitrage opportunities (auto) | "Scan Oddsportal" button triggers automated scrape | ⬜ 3 |
| REQ-AR-2 | Scan Oddspedia for arbitrage opportunities (interactive) | "Scan Oddspedia" button triggers interactive browser session | ⬜ 3 |
| REQ-AR-3 | Display arbitrage opportunities with profit percentage | Each opportunity shows event, market, sport, and % profit | ⬜ 3 |
| REQ-AR-4 | Show scanning status with real-time feedback | Status bar shows current state (Ready, Scanning, Found X, Error) | ⬜ 3 |
| REQ-AR-5 | Handle CAPTCHA requirements gracefully | Oddspedia scan warns user about manual CAPTCHA | ⬜ 3 |
| REQ-AR-6 | Prevent concurrent scans | Buttons disabled while a scan is in progress | ⬜ 4 |

### Business Rules
- Profit percentage must be calculated accurately
- Opportunities should be sorted by highest profit
- Source must be clearly labeled

---

## 5. Stats Hub

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-ST-1 | Display curated sports datasets | StatsDashboard renders available datasets | ⬜ 3 |
| REQ-ST-2 | Import data from external sources (Kaggle, vault) | Data pipeline fetches and stores datasets | ⬜ 3 |
| REQ-ST-3 | Provide searchable/filterable stats interface | Users can search and filter across dataset fields | ⬜ 2 |
| REQ-ST-4 | Display dataset metadata (source, size, date) | Each dataset shows origin, record count, last update | ⬜ 2 |
| REQ-ST-5 | Intelligence module for AI/ML insights | Analyze patterns and deliver predictions | ⬜ 2 |

### Business Rules
- Datasets must credit their source
- Data should be refreshable on demand
- Statistics are informational only

---

## 6. Streaming & Scrapers

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-SC-1 | Support 19+ scraper implementations for different sports/sources | Each scraper returns events matching `ScrapedEvent` type | ⬜ 3 |
| REQ-SC-2 | Aggregate events across all scrapers in parallel | `getAggregatedEvents()` uses `Promise.allSettled()` | ⬜ 4 |
| REQ-SC-3 | Extract stream URLs (iframe embeds, direct links) | Stream extraction returns `StreamLink` objects with metadata | ⬜ 3 |
| REQ-SC-4 | Global stream player overlay | `GlobalStreamPlayer` renders streams in persistent overlay | ⬜ 3 |
| REQ-SC-5 | Stream context for app-wide stream state | `StreamProvider` manages active stream across routes | ⬜ 3 |
| REQ-SC-6 | Fallback stream links (event page URL) | Always provide at least the event page as a fallback | ⬜ 4 |
| REQ-SC-7 | Parse timestamps from multiple formats | Support ISO, 12h, 24h, relative, and descriptive time formats | ⬜ 4 |
| REQ-SC-8 | Browser manager for Puppeteer sessions | Reuse browser instances to reduce resource usage | ⬜ 3 |
| REQ-SC-9 | API route `/api/scrape` for on-demand scraping | Returns structured JSON with success/error status | ⬜ 3 |
| REQ-SC-10 | API route `/api/streams` for stream data | Returns available streams for a given event | ⬜ 3 |
| REQ-SC-11 | API route `/api/resolve-stream` for URL resolution | Resolves stream embed URLs from event pages | ⬜ 3 |

### Business Rules
- Failed scrapers must not crash the aggregation
- Scrapers should handle anti-bot protection gracefully
- Stream quality, language, and ad count must be reported
- All scrapers are independent and modular

---

## 7. Events & Sports Detail

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-EV-1 | Dynamic event detail page at `/events/[eventId]` | Page renders specific event with full details | ⬜ 3 |
| REQ-EV-2 | Dynamic sport listing page at `/sports/[sportKey]` | Page renders all events for a specific sport | ⬜ 3 |
| REQ-EV-3 | Display available streams for individual events | Event detail shows stream sources with quality badges | ⬜ 3 |
| REQ-EV-4 | Show team info, odds, and match metadata | Event page includes teams, time, league, and odds | ⬜ 2 |

### Business Rules
- Event pages must handle missing data gracefully
- Invalid event/sport keys should render 404

---

## 8. Layout & Navigation

### Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-LN-1 | Persistent header with navigation links | Header renders on all pages with links to all sections | ⬜ 3 |
| REQ-LN-2 | Footer with site info and links | Footer renders on all pages | ⬜ 3 |
| REQ-LN-3 | Dark/Light theme toggle | ThemeToggle switches between themes; persists on refresh | ⬜ 3 |
| REQ-LN-4 | Responsive design (mobile, tablet, desktop) | All pages render correctly on all viewport sizes | ⬜ 3 |
| REQ-LN-5 | Global error page | `error.tsx` catches unhandled errors with retry option | ⬜ 3 |
| REQ-LN-6 | 404 Not Found page | `not-found.tsx` renders for invalid routes | ⬜ 3 |
| REQ-LN-7 | Loading state page | `loading.tsx` provides global loading fallback | ⬜ 3 |

### Business Rules
- Theme preference should persist across sessions
- Navigation must be accessible (keyboard, screen reader)

---

## 9. Non-Functional Requirements

| ID | Requirement | Acceptance Criteria | Stage |
|----|-------------|---------------------|-------|
| REQ-NF-1 | Page load ≤ 3 seconds on 4G | Lighthouse performance score ≥ 80 | ⬜ 2 |
| REQ-NF-2 | SEO metadata on all pages | Every page has title, description, and proper heading hierarchy | ⬜ 3 |
| REQ-NF-3 | Error resilience (error boundaries) | Component errors isolated; no full-page crashes | ⬜ 4 |
| REQ-NF-4 | TypeScript strict mode | All code type-safe, no `any` overuse | ⬜ 3 |
| REQ-NF-5 | Modular scraper architecture | Scrapers are independent; can add/remove without side effects | ⬜ 4 |
| REQ-NF-6 | Rate limiting for scraper requests | API routes handle rate limiting to avoid IP bans | ⬜ 1 |
| REQ-NF-7 | Caching for non-live data | Static and semi-static data is cached appropriately | ⬜ 1 |
| REQ-NF-8 | Accessibility (WCAG 2.1 AA) | Semantic HTML, keyboard nav, contrast ratios | ⬜ 2 |
