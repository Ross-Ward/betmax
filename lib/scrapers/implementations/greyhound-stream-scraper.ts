import puppeteer from 'puppeteer';
import { Event, StreamLink } from '@/lib/types';
import { getBrowser } from '../browser-manager';

const BASE_URL = 'https://greyhounds.attheraces.com/video/live-video';

export async function getGreyhoundStreamEvents(): Promise<Event[]> {
    console.log('Scraping At The Races Greyhounds for live streams...');

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Import anti-detection utilities
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });

        // Wait for race cards container
        await page.waitForSelector('.type-heading-b', { timeout: 10000 }).catch(() => { });

        const events = await page.evaluate((baseUrl) => {
            const extracted: any[] = [];

            // The structure seems to be sections with H2 for track name, followed by race buttons
            // We need to find the containers. Based on HTML, H2 is inside a div that is inside a flex col.
            // Let's iterate through the headings and find the associated race times in the following structure.

            const trackHeadings = Array.from(document.querySelectorAll('h2.type-heading-b span')); // "Dunstall Park", "Romford", etc.

            trackHeadings.forEach((span) => {
                const trackName = span.textContent?.trim();
                if (!trackName) return;

                // Go up to the container that likely holds the races
                // h2 -> div -> div -> div (container of header)
                // The races seem to be in a sibling or further down in the DOM structure relative to the header section.
                // Looking at HTML: <div class="flex flex-col gap-y-3 ... bg-white ..."> contains the Header and then a stack div with races.

                const headerContainer = span.closest('.bg-white');
                if (!headerContainer) return;

                const raceButtons = Array.from(headerContainer.querySelectorAll('button .button__title'));

                raceButtons.forEach((btn, index) => {
                    const timeText = btn.textContent?.trim(); // "11:01", "11:18"
                    if (!timeText) return;

                    // Construct a timestamp (assuming today)
                    const now = new Date();
                    const [hours, minutes] = timeText.split(':').map(Number);
                    const raceTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

                    // If time is earlier than now by a significant margin, might be tomorrow? 
                    // But the page has tabs for dates. We are on default (Today).
                    // Let's just assume today.

                    extracted.push({
                        id: `greyhound_${trackName}_${timeText}_${Date.now()}_${index}`,
                        name: `${trackName} ${timeText}`,
                        commence_time: raceTime.toISOString(),
                        sport_key: 'greyhound_racing',
                        sport_title: 'Greyhound Racing',
                        home_team: trackName,
                        away_team: `Race at ${timeText}`,
                        league: {
                            id: 'greyhound_racing_world',
                            name: 'Worldwide Greyhound Racing',
                            sport: 'greyhound_racing',
                            country: 'International'
                        },
                        bookmakers: [],
                        streams: [],
                        url: baseUrl, // Points to the live video page
                        source: 'At The Races Greyhounds',
                        images: []
                    });
                });
            });

            // Fallback if no specific races scraped, add a generic "Live Channel" event
            if (extracted.length === 0) {
                extracted.push({
                    id: `greyhound_live_channel_${Date.now()}`,
                    name: 'Greyhound Racing Live Channel',
                    commence_time: 'Live',
                    sport_key: 'greyhound_racing',
                    sport_title: 'Greyhound Racing',
                    home_team: 'Live Stream',
                    away_team: 'At The Races',
                    league: {
                        id: 'greyhound_racing_world',
                        name: 'Worldwide Greyhound Racing',
                        sport: 'greyhound_racing',
                        country: 'International'
                    },
                    bookmakers: [],
                    streams: [],
                    url: baseUrl,
                    source: 'At The Races Greyhounds',
                    images: []
                });
            }

            return extracted;
        }, BASE_URL);

        await page.close();

        // Populate streams for each event since they all use the same live channel
        const streamLink: StreamLink = {
            streamer: 'At The Races',
            link_name: 'Live Channel',
            url: BASE_URL,
            mobile: 'yes',
            quality: 'HD',
            ads: 0,
            language: 'English'
        };

        // Check if we can extract the m3u8
        // We do this in a separate call or reusing the knowledge
        // But getGreyhoundStreamStreams is simpler to just return the page or scrape it dynamically.

        events.forEach(e => e.streams.push(streamLink));

        console.log(`Found ${events.length} greyhound racing events`);
        return events as Event[];

    } catch (error) {
        console.error('At The Races Greyhounds scrape error:', error);
        return [];
    }
}

export async function getGreyhoundStreamStreams(url: string): Promise<StreamLink[]> {
    console.log(`Scraping greyhound racing streams from: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        const streams = await page.evaluate(() => {
            const results: any[] = [];

            // Try to find the m3u8 source in the special div
            // <div class="..." src="https://...m3u8...">
            const playerDiv = document.querySelector('div[src*=".m3u8"]');
            if (playerDiv) {
                const src = playerDiv.getAttribute('src');
                if (src) {
                    results.push({
                        streamer: 'At The Races Stream',
                        link_name: 'Direct Stream',
                        url: src,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 0,
                        language: 'English'
                    });
                }
            }

            // Also return the page itself
            results.push({
                streamer: 'At The Races Page',
                link_name: 'Watch on Site',
                url: window.location.href,
                mobile: 'yes',
                quality: 'HD',
                ads: 0,
                language: 'English'
            });

            return results;
        });

        await page.close();
        return streams as StreamLink[];

    } catch (error) {
        console.error('At The Races Greyhounds stream scrape error:', error);
        return [];
    }
}
