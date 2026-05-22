# BetMax — Task Tracker

> **Version**: 1.0  
> **Last Updated**: 2026-02-14  
> **Legend**: ⬜ = Defined | 🟡 = Designed | 🟢 = Implemented | ✅ = Verified | 🚀 = Complete

---

## 1. Homepage

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-HP-1 | Implement Hero component with branding | REQ-HP-1 | §1 Hero | ✅ 4 |
| TASK-HP-2 | Build LiveStatsGrid with real-time fetch | REQ-HP-2 | §1 Data Flow | ✅ 4 |
| TASK-HP-3 | Create PopularSports navigation cards | REQ-HP-3 | §1 Static-first | ✅ 4 |
| TASK-HP-4 | Build SoccerHighlights section | REQ-HP-4 | §1 Component Structure | ✅ 4 |
| TASK-HP-5 | Build FeaturedRaces section | REQ-HP-5 | §1 Component Structure | ✅ 4 |
| TASK-HP-6 | Build CricketHighlights section | REQ-HP-6 | §1 Component Structure | ✅ 4 |
| TASK-HP-7 | Build UpcomingMatches section | REQ-HP-7 | §1 Component Structure | ✅ 4 |
| TASK-HP-8 | Add ErrorBoundary + Suspense wrappers | REQ-HP-8 | §1 Error Boundaries | ✅ 4 |
| TASK-HP-9 | Verify homepage loads <3s, all sections render | REQ-HP-1–8 | §1 | ⬜ 1 |
| TASK-HP-10 | Test error boundary fallbacks work correctly | REQ-HP-8 | §1 | ⬜ 1 |

---

## 2. Live Events

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-LE-1 | Implement LivePage with getAggregatedEvents | REQ-LE-1 | §2 Data Flow | ✅ 4 |
| TASK-LE-2 | Build LiveDashboard component | REQ-LE-1, LE-3 | §2 Component Structure | ✅ 4 |
| TASK-LE-3 | Add sport category filter to LiveDashboard | REQ-LE-2 | §2 | ✅ 4 |
| TASK-LE-4 | Implement stream link display per event | REQ-LE-4 | §2 + §6 | ✅ 4 |
| TASK-LE-5 | Verify force-dynamic rendering behavior | REQ-LE-5 | §2 Force-dynamic | ✅ 4 |
| TASK-LE-6 | Add auto-refresh polling mechanism | REQ-LE-6 | §2 | ✅ 4 |
| TASK-LE-7 | Test all event cards render correctly | REQ-LE-3 | §2 | ✅ 4 |
| TASK-LE-8 | Implement Live/Hot/Favorites combined filters | REQ-LE-2 | §2 | ✅ 4 |

---

## 3. Sports Betting

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-SB-1 | Implement BettingPage with getBettingEvents | REQ-SB-1, SB-2 | §3 | 🟢 3 |
| TASK-SB-2 | Build BettingDashboard component | REQ-SB-1 | §3 Dashboard Pattern | 🟢 3 |
| TASK-SB-3 | Implement odds comparison view | REQ-SB-3 | §3 | 🟡 2 |
| TASK-SB-4 | Add loading spinner with status text | REQ-SB-4 | §3 | 🟢 3 |
| TASK-SB-5 | Add sport filter dropdown | REQ-SB-5 | §3 | 🟡 2 |
| TASK-SB-6 | Implement odds format toggle (decimal/fractional) | REQ-SB-6 | §3 | ⬜ 1 |
| TASK-SB-7 | Implement /api/betting endpoint | REQ-SB-2 | §3 API Contract | 🟢 3 |
| TASK-SB-8 | Test betting data renders correctly | REQ-SB-1 | §3 | ⬜ 1 |

---

## 4. Arbitrage Scanner

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-AR-1 | Implement ArbitragePage client component | REQ-AR-1–6 | §4 Client-only | 🟢 3 |
| TASK-AR-2 | Build OddsPortal auto-scan functionality | REQ-AR-1 | §4 Dual Scan | 🟢 3 |
| TASK-AR-3 | Build Oddspedia interactive scan with CAPTCHA warning | REQ-AR-2, AR-5 | §4 | 🟢 3 |
| TASK-AR-4 | Display opportunities with profit % | REQ-AR-3 | §4 Data Model | 🟢 3 |
| TASK-AR-5 | Implement status feedback bar | REQ-AR-4 | §4 State Machine | 🟢 3 |
| TASK-AR-6 | Add concurrent scan prevention | REQ-AR-6 | §4 | ✅ 4 |
| TASK-AR-7 | Implement /api/scrape endpoint | REQ-AR-1, AR-2 | §4 API Contract | 🟢 3 |
| TASK-AR-8 | Test arbitrage scanner end-to-end | REQ-AR-1–6 | §4 | ⬜ 1 |

---

## 5. Stats Hub

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-ST-1 | Build StatsDashboard component | REQ-ST-1 | §5 Component Structure | 🟢 3 |
| TASK-ST-2 | Implement dataset vault with 15+ data files | REQ-ST-1 | §5 Data Vault | 🟢 3 |
| TASK-ST-3 | Build dataset orchestrator | REQ-ST-2 | §5 Orchestrator | 🟢 3 |
| TASK-ST-4 | Implement Kaggle data importer | REQ-ST-2 | §5 Kaggle | 🟢 3 |
| TASK-ST-5 | Add search/filter interface | REQ-ST-3 | §5 | 🟡 2 |
| TASK-ST-6 | Display dataset metadata | REQ-ST-4 | §5 | 🟡 2 |
| TASK-ST-7 | Build intelligence/analytics module | REQ-ST-5 | §5 Intelligence | 🟡 2 |
| TASK-ST-8 | Implement /api/datasets endpoint | REQ-ST-1, ST-2 | §5 API Contract | 🟢 3 |
| TASK-ST-9 | Test stats dashboard rendering | REQ-ST-1 | §5 | ⬜ 1 |

---

## 6. Streaming & Scrapers

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-SC-1 | Implement NFL scraper | REQ-SC-1 | §6 Implementations | 🟢 3 |
| TASK-SC-2 | Implement NBA scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-3 | Implement F1 scrapers (2 variants) | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-4 | Implement MotoGP scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-5 | Implement horse racing scrapers (2 variants) | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-6 | Implement greyhound scrapers (2 variants) | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-7 | Implement soccer scrapers (3 variants) | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-8 | Implement StreamEast scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-9 | Implement SportSurge scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-10 | Implement Sky News scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-11 | Implement Cricket scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-12 | Implement UFC/Tapology scrapers | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-13 | Implement PGA scraper | REQ-SC-1 | §6 | 🟢 3 |
| TASK-SC-14 | Build aggregator with Promise.allSettled | REQ-SC-2 | §6 Parallel | ✅ 4 |
| TASK-SC-15 | Implement stream URL extraction | REQ-SC-3 | §6 Stream Extraction | 🟢 3 |
| TASK-SC-16 | Build GlobalStreamPlayer overlay | REQ-SC-4 | §6 Stream Context | 🟢 3 |
| TASK-SC-17 | Implement StreamProvider context | REQ-SC-5 | §6 Stream Context | 🟢 3 |
| TASK-SC-18 | Add fallback stream links | REQ-SC-6 | §6 | ✅ 4 |
| TASK-SC-19 | Build multi-format timestamp parser | REQ-SC-7 | §6 | ✅ 4 |
| TASK-SC-20 | Implement browser-manager (Puppeteer pool) | REQ-SC-8 | §6 Browser Reuse | 🟢 3 |
| TASK-SC-21 | Implement /api/scrape endpoint | REQ-SC-9 | §6 | 🟢 3 |
| TASK-SC-22 | Implement /api/streams endpoint | REQ-SC-10 | §6 | 🟢 3 |
| TASK-SC-23 | Implement /api/resolve-stream endpoint | REQ-SC-11 | §6 | 🟢 3 |
| TASK-SC-24 | Add rate limiting to scraper API routes | REQ-NF-6 | §9 | ⬜ 1 |
| TASK-SC-25 | Add caching layer for semi-static data | REQ-NF-7 | §9 | ⬜ 1 |
| TASK-SC-26 | Verify all 19 scrapers produce valid output | REQ-SC-1 | §6 | ⬜ 1 |
| TASK-SC-27 | Add proxy rotation support | REQ-SC-1 | §6 Next Steps | ⬜ 1 |

---

## 7. Events & Sports Detail

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-EV-1 | Build /events/[eventId] detail page | REQ-EV-1 | §7 Dynamic Routes | 🟢 3 |
| TASK-EV-2 | Build /sports/[sportKey] listing page | REQ-EV-2 | §7 | 🟢 3 |
| TASK-EV-3 | Add stream source display on event detail | REQ-EV-3 | §7 | 🟢 3 |
| TASK-EV-4 | Add odds/team info to event detail | REQ-EV-4 | §7 | 🟡 2 |
| TASK-EV-5 | Handle 404 for invalid event/sport IDs | REQ-EV-1, EV-2 | §7 | ⬜ 1 |
| TASK-EV-6 | Test event detail rendering | REQ-EV-1 | §7 | ⬜ 1 |

---

## 8. Layout & Navigation

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-LN-1 | Build persistent Header with nav links | REQ-LN-1 | §8 | 🟢 3 |
| TASK-LN-2 | Build Footer with site info | REQ-LN-2 | §8 | 🟢 3 |
| TASK-LN-3 | Implement ThemeToggle dark/light switch | REQ-LN-3 | §8 Theme | 🟢 3 |
| TASK-LN-4 | Ensure responsive design across breakpoints | REQ-LN-4 | §8 | 🟢 3 |
| TASK-LN-5 | Build global error page (error.tsx) | REQ-LN-5 | §8 | 🟢 3 |
| TASK-LN-6 | Build 404 page (not-found.tsx) | REQ-LN-6 | §8 | 🟢 3 |
| TASK-LN-7 | Build loading fallback (loading.tsx) | REQ-LN-7 | §8 | 🟢 3 |
| TASK-LN-8 | Set up Radix UI component library | REQ-LN-1–7 | §8 UI Components | 🟢 3 |
| TASK-LN-9 | Verify theme persistence across refresh | REQ-LN-3 | §8 | ⬜ 1 |
| TASK-LN-10 | Verify keyboard/screen-reader navigation | REQ-LN-1 | §8 | ⬜ 1 |

---

## 9. Non-Functional / Cross-Cutting

| Task ID | Task | REQ | Design Ref | Stage |
|---------|------|-----|------------|-------|
| TASK-NF-1 | Run Lighthouse performance audit | REQ-NF-1 | §9 Performance | ⬜ 1 |
| TASK-NF-2 | Audit SEO metadata on all pages | REQ-NF-2 | §9 SEO | 🟢 3 |
| TASK-NF-3 | Verify error boundary isolation | REQ-NF-3 | §9 Error Resilience | 🟢 3 |
| TASK-NF-4 | Run TypeScript strict-mode lint check | REQ-NF-4 | §9 Type Safety | 🟢 3 |
| TASK-NF-5 | Verify scraper independence (add/remove test) | REQ-NF-5 | §9 Modularity | ⬜ 1 |
| TASK-NF-6 | Implement API rate limiting middleware | REQ-NF-6 | §9 | ⬜ 1 |
| TASK-NF-7 | Implement response caching strategy | REQ-NF-7 | §9 | ⬜ 1 |
| TASK-NF-8 | Run WCAG 2.1 AA a11y audit | REQ-NF-8 | §9 | ⬜ 1 |

---

## Summary by Section

| Section | Total | 🚀 5 | ✅ 4 | 🟢 3 | 🟡 2 | ⬜ 1 |
|---------|-------|-------|-------|-------|-------|-------|
| Homepage | 10 | 0 | 8 | 0 | 0 | 2 |
| Live Events | 7 | 0 | 7 | 0 | 0 | 0 |
| Sports Betting | 8 | 0 | 0 | 4 | 2 | 2 |
| Arbitrage | 8 | 0 | 1 | 5 | 0 | 2 |
| Stats Hub | 9 | 0 | 0 | 5 | 3 | 1 |
| Streaming | 27 | 0 | 3 | 19 | 0 | 5 |
| Events/Sports | 6 | 0 | 0 | 3 | 1 | 2 |
| Layout/Nav | 10 | 0 | 0 | 8 | 0 | 2 |
| Non-Functional | 8 | 0 | 0 | 3 | 0 | 5 |
| **TOTAL** | **93** | **0** | **19** | **47** | **6** | **21** |
