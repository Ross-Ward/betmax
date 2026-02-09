import { Event, StreamLink } from "@/lib/types";
import { getLiveEvents as getTotalsportekEvents, getEventStreams as getTotalsportekStreams } from "./totalsportek";
import { getGamestrendEvents, getGamestrendStreams } from "./gamestrend";
import { getF1StreamsFreeEvents, getHufootEvents, getF1StreamsFreeStreams, getHufootStreams } from "./papashd";
import { getAllBettingOdds } from "./betting-scraper";

// Import all new dedicated scrapers
import { getNFLEvents, getNFLStreams } from "./implementations/nfl-scraper";
import { getNBAEvents, getNBAStreams } from "./implementations/nba-scraper";
import { getF1FootybiteEvents, getF1FootybiteStreams } from "./implementations/f1-footybite-scraper";
import { getMotoGPEvents, getMotoGPStreams } from "./implementations/motogp-scraper";
import { getHorseRacingEvents, getHorseRacingStreams } from "./implementations/horseracing-scraper";
import { getGreyhoundStreamEvents, getGreyhoundStreamStreams } from "./implementations/greyhound-stream-scraper";
import { getSoccerFreeEvents, getSoccerFreeStreams } from "./implementations/soccer-free-scraper";
import { getSportSurgeEvents, getSportSurgeStreams } from "./implementations/sportsurge-scraper";
import { getStreamEastEvents, getStreamEastStreams } from "./implementations/streameast-scraper";
import { getSkyNewsEvents, getSkyNewsStreams } from "./implementations/skynews-scraper";
import { getCricketEvents, getCricketStreams } from "./implementations/cricket-scraper";

import { DatasetVault } from "../data/dataset-vault";

export async function getAggregatedEvents(): Promise<Event[]> {
    console.log("Checking Event Cache...");

    // Try to load from cache first
    const cacheKey = 'aggregated_stream_events';
    const cache = await DatasetVault.load(cacheKey) as any;
    const now = Date.now();
    const cacheTime = new Date(cache?.timestamp || 0).getTime();

    // 2 minutes stale, 10 minutes expired
    const isStale = now - cacheTime > 1000 * 60 * 2;
    const isExpired = now - cacheTime > 1000 * 60 * 10;

    if (cache && cache.events && !isExpired) {
        if (isStale) {
            console.log("Cache is stale (2m+), refreshing in background...");
            initiateBackgroundEventScrape();
        }
        return cache.events;
    }

    if (activeEventScrapePromise) {
        console.log("Attaching to existing global event scrape...");
        return activeEventScrapePromise;
    }

    return await performEventScrape();
}

let activeEventScrapePromise: Promise<Event[]> | null = null;

function initiateBackgroundEventScrape() {
    if (activeEventScrapePromise) return;
    performEventScrape().catch(err => console.error("Background event scrape failed:", err));
}

async function performEventScrape(): Promise<Event[]> {
    activeEventScrapePromise = (async () => {
        try {
            console.log("Starting Aggregated Stream Scrape from ALL sources...");

            const { withTimeout } = await import('./scraper-utils');

            // Wrap each scraper with 20s timeout
            const scrapers = [
                { name: 'TotalSportek', fn: getTotalsportekEvents },
                { name: 'Gamestrend', fn: getGamestrendEvents },
                { name: 'F1StreamsFree', fn: getF1StreamsFreeEvents },
                { name: 'Hufoot', fn: getHufootEvents },
                { name: 'NFL', fn: getNFLEvents },
                { name: 'NBA', fn: getNBAEvents },
                { name: 'F1Footybite', fn: getF1FootybiteEvents },
                { name: 'MotoGP', fn: getMotoGPEvents },
                { name: 'HorseRacing', fn: getHorseRacingEvents },
                { name: 'Greyhound', fn: getGreyhoundStreamEvents },
                { name: 'SoccerFree', fn: getSoccerFreeEvents },
                { name: 'SportSurge', fn: getSportSurgeEvents },
                { name: 'StreamEast', fn: getStreamEastEvents },
                { name: 'SkyNews', fn: getSkyNewsEvents },
                { name: 'Cricket', fn: getCricketEvents }
            ];

            // Run scrapers with concurrency limit of 3
            const allEvents: Event[] = [];
            const concurrencyLimit = 3;

            for (let i = 0; i < scrapers.length; i += concurrencyLimit) {
                const batch = scrapers.slice(i, i + concurrencyLimit);
                const results = await Promise.allSettled(
                    batch.map(({ name, fn }) =>
                        withTimeout(
                            fn(),
                            20000,
                            `${name} scraper timeout`
                        ).catch(err => {
                            console.error(`[${name}] Failed:`, err.message);
                            return [];
                        })
                    )
                );

                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        const validEvents = result.value.filter((e: Event) => {
                            const name = (e.name || "").toLowerCase();
                            const home = (e.home_team || "").toLowerCase();
                            const away = (e.away_team || "").toLowerCase();

                            return !name.includes('unknown team') &&
                                !home.includes('unknown team') &&
                                !away.includes('unknown team') &&
                                !home.includes('team a') &&
                                !away.includes('team b');
                        });
                        allEvents.push(...validEvents);
                        console.log(`[${batch[idx].name}] Got ${validEvents.length} events`);
                    }
                });
            }

            console.log(`Total events aggregated: ${allEvents.length}`);

            // Save to cache
            await DatasetVault.save('aggregated_stream_events', {
                events: allEvents,
                timestamp: new Date().toISOString()
            });

            return allEvents;
        } finally {
            activeEventScrapePromise = null;
        }
    })();

    return activeEventScrapePromise;
}

/**
 * Centrally dispatch stream requests to the correct scraper based on URL
 */
export async function getEventStreams(url: string): Promise<StreamLink[]> {
    console.log(`Routing stream request for: ${url}`);

    // Route to appropriate scraper based on URL
    if (url.includes('totalsportek')) {
        return await getTotalsportekStreams(url);
    } else if (url.includes('gamestrend')) {
        return await getGamestrendStreams(url);
    } else if (url.includes('f1streamsfree')) {
        return await getF1StreamsFreeStreams(url);
    } else if (url.includes('hufoot')) {
        return await getHufootStreams(url);
    } else if (url.includes('nflbite')) {
        return await getNFLStreams(url);
    } else if (url.includes('nbabite')) {
        return await getNBAStreams(url);
    } else if (url.includes('f1.footybite')) {
        return await getF1FootybiteStreams(url);
    } else if (url.includes('motogp.footybite')) {
        return await getMotoGPStreams(url);
    } else if (url.includes('attheraces.com/atrplayer')) {
        return await getHorseRacingStreams(url);
    } else if (url.includes('greyhounds.attheraces')) {
        return await getGreyhoundStreamStreams(url);
    } else if (url.includes('soccer-free')) {
        return await getSoccerFreeStreams(url);
    } else if (url.includes('sportsurge')) {
        return await getSportSurgeStreams(url);
    } else if (url.includes('streameast')) {
        return await getStreamEastStreams(url);
    } else if (url.includes('sky.com')) {
        return await getSkyNewsStreams(url);
    } else if (url.includes('espncricinfo')) {
        return await getCricketStreams(url);
    }

    console.warn(`No scraper found for URL: ${url}`);
    return [];
}




export async function getBettingEvents(): Promise<Event[]> {
    console.log("Fetching Betting Events (with Intelligence check)...");

    // Load from vault
    const cache = await DatasetVault.load('global_betting_odds') as any;
    const now = Date.now();
    const cacheTime = new Date(cache?.timestamp || 0).getTime();
    const isStale = now - cacheTime > 1000 * 60 * 2; // 2 minutes stale
    const isExpired = now - cacheTime > 1000 * 60 * 15; // 15 minutes expired

    if (cache && cache.events && !isExpired) {
        if (isStale) {
            console.log("Cache stale (2m+), refreshing in background...");
            // Non-blocking background refresh
            initiateBackgroundScrape();
        }
        return cache.events;
    }

    // Blocking fetch if no cache or expired
    console.log("No valid cache, performing deep scan...");

    if (activeScrapePromise) {
        console.log("Attaching to existing global scrape...");
        return activeScrapePromise;
    }

    return await performScrape();
}

let activeScrapePromise: Promise<Event[]> | null = null;

function initiateBackgroundScrape() {
    if (activeScrapePromise) {
        console.log("Background scrape skipped - already in progress");
        return;
    }

    // We don't await this, it runs in background
    performScrape().catch(err => console.error("Background scrape failed:", err));
}

async function performScrape(): Promise<Event[]> {
    activeScrapePromise = (async () => {
        try {
            const { withTimeout } = await import('./scraper-utils');

            // Add 60s timeout to betting odds scrape
            const events = await withTimeout(
                getAllBettingOdds(),
                60000,
                'Betting odds scrape timeout'
            );

            await DatasetVault.save('global_betting_odds', {
                events,
                timestamp: new Date().toISOString()
            });
            return events;
        } catch (error) {
            console.error('[BETTING] Scrape failed:', error);
            // Return empty array instead of throwing
            return [];
        } finally {
            activeScrapePromise = null;
        }
    })();

    return activeScrapePromise;
}


export async function getSoccerData() {
    const { SoccerScraper } = await import("./implementations/soccer-scraper");
    const scraper = new SoccerScraper();
    return await scraper.scrape();
}

export async function getGreyhoundData() {
    const { GreyhoundScraper } = await import("./implementations/greyhounds-scraper");
    const scraper = new GreyhoundScraper();
    return await scraper.scrape();
}
