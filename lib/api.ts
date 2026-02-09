import { Event, Sport } from './types';
import { getRealGamesToday } from './real-games-scraper';
import { getBettingEvents } from './scrapers/index';

/**
 * CORE SPORTS CONFIGURATION
 */
const SPORTS: Sport[] = [
    { key: 'soccer', group: 'Soccer', title: 'Soccer', description: 'Global Football', active: true, has_outrights: false },
    { key: 'basketball', group: 'Basketball', title: 'NBA', description: 'US Basketball', active: true, has_outrights: false },
    { key: 'nfl', group: 'American Football', title: 'NFL', description: 'US Football', active: true, has_outrights: false },
    { key: 'nhl', group: 'Hockey', title: 'NHL', description: 'US Hockey', active: true, has_outrights: false },
    { key: 'f1', group: 'Formula 1', title: 'F1', description: 'Formula 1 Racing', active: true, has_outrights: false },
    { key: 'motogp', group: 'Motorsport', title: 'MotoGP', description: 'Grand Prix Racing', active: true, has_outrights: false },
    { key: 'ufc', group: 'UFC', title: 'UFC', description: 'UFC Fights', active: true, has_outrights: false },
    { key: 'horse', group: 'Horse Racing', title: 'Horse Racing', description: 'Track Meetings', active: true, has_outrights: false },
    { key: 'boxing', group: 'Boxing', title: 'Boxing', description: 'Boxing Matches', active: true, has_outrights: false },
    { key: 'tennis', group: 'Tennis', title: 'Tennis', description: 'Tennis Tournaments', active: true, has_outrights: false },
    { key: 'news', group: 'News', title: 'Sports News', description: 'Latest Sports News', active: true, has_outrights: false },
];

/**
 * FETCH AVAILABLE SPORTS
 */
export async function getSports(): Promise<Sport[]> {
    return SPORTS;
}

/**
 * FETCH FEATURED EVENTS (Used on Homepage)
 * Routes to live betting intelligence with a real ESPN fallback.
 */
export async function getFeaturedEvents(): Promise<Event[]> {
    try {
        console.log('[API] Routing to real high-fidelity intelligence...');
        const events = await getBettingEvents();
        if (events.length > 0) return events.slice(0, 10);
    } catch (e) {
        console.error("[API] Intelligence layer busy, checking scoreboard fallback:", e);
    }

    // Strictly real ESPN scoreboard fallback
    return getRealGamesToday();
}

/**
 * FETCH EVENTS BY SPORT
 */
export async function getEventsBySport(sportKey: string): Promise<Event[]> {
    try {
        console.log(`[API] Fetching real ${sportKey} data...`);
        const allEvents = await getBettingEvents();

        // Match by key or title
        const filtered = allEvents.filter(e =>
            e.sport_key.toLowerCase().includes(sportKey.toLowerCase()) ||
            e.sport_title.toLowerCase().includes(sportKey.toLowerCase())
        );

        if (filtered.length > 0) return filtered;
    } catch (e) {
        console.error(`[API] Failed to fetch real odds for ${sportKey}:`, e);
    }

    return [];
}

/**
 * FETCH SINGLE EVENT BY ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        const events = await getBettingEvents();
        return events.find(e => e.id === eventId) || null;
    } catch (e) {
        return null;
    }
}
