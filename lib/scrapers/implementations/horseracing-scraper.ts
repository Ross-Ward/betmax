import puppeteer from 'puppeteer';
import { Event, StreamLink } from '@/lib/types';

const BASE_URL = 'https://www.attheraces.com/atrplayer-stream/usa';

export async function getHorseRacingEvents(): Promise<Event[]> {
    console.log('Scraping At The Races for live horse racing...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForSelector('body', { timeout: 10000 }).catch(() => { });

        const events = await page.evaluate((baseUrl) => {
            const extracted: any[] = [];

            // Look for race cards/events
            const raceCards = Array.from(document.querySelectorAll(
                '.race-card, .meeting-card, [class*="race"], a[href*="/race/"]'
            ));

            raceCards.forEach((card, index) => {
                const anchor = card.tagName === 'A' ? card : card.querySelector('a');
                const href = anchor?.getAttribute('href') || baseUrl;

                const text = (card as HTMLElement).innerText || '';
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

                let venue = 'Unknown Venue';
                let time = 'Upcoming';
                let raceNumber = '';
                let distance = '';

                // Look for venue
                const venueElement = card.querySelector('.venue, .course, .track, [class*="venue"]');
                if (venueElement) {
                    venue = (venueElement as HTMLElement).innerText.trim();
                }

                // Look for time
                const timeElement = card.querySelector('.time, .race-time, [class*="time"]');
                if (timeElement) {
                    time = (timeElement as HTMLElement).innerText.trim();
                }

                // Look for race number
                const raceNumElement = card.querySelector('.race-number, [class*="race-num"]');
                if (raceNumElement) {
                    raceNumber = (raceNumElement as HTMLElement).innerText.trim();
                }

                // Look for distance
                const distanceElement = card.querySelector('.distance, [class*="distance"]');
                if (distanceElement) {
                    distance = (distanceElement as HTMLElement).innerText.trim();
                }

                // Fallback parsing
                if (venue === 'Unknown Venue' && lines.length > 0) {
                    venue = lines[0];
                    if (lines.length > 1) {
                        time = lines[1];
                    }
                }

                const images = Array.from(card.querySelectorAll('img')).map(img => img.src);

                extracted.push({
                    id: `horse_${index}_${Date.now()}`,
                    name: `${venue} ${raceNumber ? `Race ${raceNumber}` : ''}`.trim(),
                    commence_time: time,
                    sport_key: 'horseracing',
                    sport_title: 'Horse Racing',
                    home_team: venue,
                    away_team: `${distance} ${raceNumber}`.trim(),
                    league: {
                        id: 'horse_racing_usa',
                        name: 'USA Horse Racing',
                        sport: 'horseracing',
                        country: 'USA'
                    },
                    bookmakers: [],
                    streams: [],
                    url: href.startsWith('http') ? href : `https://www.attheraces.com${href}`,
                    source: 'At The Races',
                    images: images.filter(Boolean)
                });
            });

            // If no specific races found, create a general live stream event
            if (extracted.length === 0) {
                extracted.push({
                    id: `horse_live_${Date.now()}`,
                    name: 'USA Horse Racing - Live Stream',
                    commence_time: 'Live',
                    sport_key: 'horseracing',
                    sport_title: 'Horse Racing',
                    home_team: 'USA Tracks',
                    away_team: 'Live Racing',
                    league: {
                        id: 'horse_racing_usa',
                        name: 'USA Horse Racing',
                        sport: 'horseracing',
                        country: 'USA'
                    },
                    bookmakers: [],
                    streams: [],
                    url: baseUrl,
                    source: 'At The Races',
                    images: []
                });
            }

            return extracted;
        }, BASE_URL);

        console.log(`Found ${events.length} horse racing events`);
        return events as Event[];

    } catch (error) {
        console.error('At The Races scrape error:', error);
        return [];
    } finally {
        await browser.close();
    }
}

export async function getHorseRacingStreams(url: string): Promise<StreamLink[]> {
    console.log(`Scraping horse racing streams from: ${url}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const streams = await page.evaluate(() => {
            const results: any[] = [];

            // Look for video player or stream elements
            const streamElements = Array.from(document.querySelectorAll(
                'video, iframe, [class*="player"], [class*="stream"], [id*="player"]'
            ));

            streamElements.forEach((elem, index) => {
                let url = '';

                if (elem.tagName === 'VIDEO') {
                    url = (elem as HTMLVideoElement).src || (elem as HTMLVideoElement).currentSrc;
                } else if (elem.tagName === 'IFRAME') {
                    url = (elem as HTMLIFrameElement).src;
                } else {
                    const anchor = elem.querySelector('a');
                    if (anchor) {
                        url = anchor.getAttribute('href') || '';
                    }
                }

                if (!url) return;

                results.push({
                    streamer: 'At The Races',
                    link_name: `Live Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://www.attheraces.com${url}`,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 0,
                    language: 'English'
                });
            });

            // If no streams found, return the page itself as a stream
            if (results.length === 0) {
                results.push({
                    streamer: 'At The Races',
                    link_name: 'Live Stream',
                    url: window.location.href,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 0,
                    language: 'English'
                });
            }

            return results;
        });

        console.log(`Found ${streams.length} horse racing streams`);
        return streams as StreamLink[];

    } catch (error) {
        console.error('At The Races stream scrape error:', error);
        return [];
    } finally {
        await browser.close();
    }
}
