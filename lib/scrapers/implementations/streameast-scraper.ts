
import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';
import { getRandomUserAgent, getRandomHeaders } from '../scraper-utils';

const BASE_URL = 'https://streameast.ps';

export async function getStreamEastEvents(): Promise<Event[]> {
    console.log('[StreamEast] Scraping events...');

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for cards
        try {
            await page.waitForSelector('.uefa-card', { timeout: 15000 });
        } catch (e) {
            console.log('[StreamEast] No .uefa-card elements found, checking for alternatives...');
        }

        const events = await page.evaluate((baseUrl) => {
            const results: any[] = [];
            const cards = Array.from(document.querySelectorAll('.uefa-card'));

            cards.forEach((card, index) => {
                try {
                    const anchor = card as HTMLAnchorElement;
                    const href = anchor.getAttribute('href');
                    if (!href) return;

                    const url = href.startsWith('http') ? href : `${baseUrl}${href}`;

                    // Extract Teams from .uefa-name
                    const nameEls = Array.from(card.querySelectorAll('.uefa-name'));
                    if (nameEls.length < 2) return;

                    const home = nameEls[0].textContent?.trim() || 'Team A';
                    const away = nameEls[1].textContent?.trim() || 'Team B';
                    const name = `${home} vs ${away}`;

                    // Determine Sport
                    let sport = 'Sports';
                    let sportKey = 'sports';

                    if (href.includes('/nba/')) { sport = 'Basketball'; sportKey = 'basketball'; }
                    else if (href.includes('/nfl/')) { sport = 'American Football'; sportKey = 'american_football'; }
                    else if (href.includes('/soccer/') || href.includes('/uefa/') || href.includes('/premier-league/')) { sport = 'Soccer'; sportKey = 'soccer'; }
                    else if (href.includes('/ufc/') || href.includes('/boxing/') || href.includes('/mma/')) { sport = 'Fighting'; sportKey = 'fighting'; }
                    else if (href.includes('/f1/') || href.includes('/formula-1/')) { sport = 'Formula 1'; sportKey = 'formula_1'; }
                    else if (href.includes('/mlb/')) { sport = 'Baseball'; sportKey = 'baseball'; }
                    else if (href.includes('/nhl/')) { sport = 'Ice Hockey'; sportKey = 'ice_hockey'; }

                    // Extract Time from data-time (Unix timestamp in seconds)
                    const timeEl = card.querySelector('.uefa-time');
                    let timestamp = Date.now();
                    let commenceTime = new Date().toISOString();
                    let status = 'Upcoming';

                    if (timeEl) {
                        const dataTime = timeEl.getAttribute('data-time'); // e.g. "1770681600"
                        if (dataTime) {
                            timestamp = parseInt(dataTime, 10) * 1000;
                            commenceTime = new Date(timestamp).toISOString();

                            // Check if live
                            const now = Date.now();
                            if (now >= timestamp && now < timestamp + (3 * 60 * 60 * 1000)) {
                                status = 'Live';
                            } else if (now > timestamp + (3 * 60 * 60 * 1000)) {
                                status = 'Ended'; // Rough estimate
                            }
                        }
                    }

                    results.push({
                        id: `se_${index}_${timestamp}`,
                        name: name,
                        sport_key: sportKey,
                        sport_title: sport,
                        commence_time: status === 'Live' ? 'Live' : commenceTime, // Or keep ISO string if preferred, but existing code uses 'Live' string often
                        home_team: home,
                        away_team: away,
                        league: {
                            id: 'streameast_league',
                            name: 'StreamEast Events',
                            sport: sport,
                            country: 'World'
                        },
                        bookmakers: [],
                        streams: [],
                        url: url,
                        source: 'StreamEast',
                        images: []
                    });
                } catch (e) {
                    // Silent
                }
            });

            return results;
        }, BASE_URL);

        await page.close();
        return events as Event[];

    } catch (error: any) {
        console.error('[StreamEast] Scrape Error:', error.message);
        return [];
    }
}

export async function getStreamEastStreams(url: string): Promise<StreamLink[]> {
    console.log(`[StreamEast] Seeking streams: ${url}`);
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Wait for potential player iframes or links
        await page.waitForSelector('iframe', { timeout: 5000 }).catch(() => { });

        const streams = await page.evaluate((pageUrl) => {
            const results: any[] = [];

            // 1. Check for iframes (embedded players)
            const iframes = Array.from(document.querySelectorAll('iframe'));
            iframes.forEach((iframe, idx) => {
                const src = iframe.src;
                if (src && (src.includes('player') || src.includes('embed') || src.includes('stream'))) {
                    results.push({
                        streamer: `StreamEast Embed ${idx + 1}`,
                        link_name: `Player ${idx + 1}`,
                        url: src,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 2,
                        language: 'English'
                    });
                }
            });

            // 2. Fallback to just returning the page itself if no specific streams found
            if (results.length === 0) {
                results.push({
                    streamer: 'StreamEast',
                    link_name: 'Watch on StreamEast',
                    url: pageUrl,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 3,
                    language: 'English'
                });
            }

            return results;
        }, url);

        await page.close();
        return streams as StreamLink[];

    } catch (error: any) {
        console.error('[StreamEast] Stream Scrape Error:', error.message);
        return [];
    }
}
