import { getBrowser } from './browser-manager';
import { Event, StreamLink } from '@/lib/types';

/**
 * Scraper for F1StreamsFree.com
 */
export async function getF1StreamsFreeEvents(): Promise<Event[]> {
    console.log('[F1StreamsFree] Scraping events...');
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto('https://www.f1streamsfree.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const events = await page.evaluate(() => {
            const results: any[] = [];
            const anchors = Array.from(document.querySelectorAll('a[href*="-grand-prix"], a[href*="/f1/"]'));

            anchors.forEach((a, index) => {
                const text = (a as HTMLElement).innerText.trim();
                const href = a.getAttribute('href');
                if (!text || !href) return;

                if (!text.toLowerCase().includes('grand prix') && !text.toLowerCase().includes(' f1 ')) return;

                results.push({
                    id: `f1s_${index}_${Date.now()}`,
                    name: text,
                    commence_time: 'Live',
                    sport_key: 'formula 1',
                    sport_title: 'Formula 1',
                    home_team: text,
                    away_team: 'Race',
                    league: {
                        id: 'f1_world',
                        name: 'F1 World Championship',
                        sport: 'formula 1',
                        country: 'Global'
                    },
                    bookmakers: [],
                    streams: [],
                    url: href.startsWith('http') ? href : `https://www.f1streamsfree.com${href}`,
                    source: 'F1StreamsFree'
                });
            });
            return results;
        });

        await page.close();
        return Array.from(new Map(events.map((item: any) => [item.url, item])).values()) as Event[];
    } catch (error: any) {
        console.error('[F1StreamsFree] Scrape Error:', error.message);
        return [];
    }
}

/**
 * Scraper for Hufoot.com (covers MotoGP, Tennis, F1, etc.)
 */
export async function getHufootEvents(): Promise<Event[]> {
    console.log('[Hufoot] Scraping events...');
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto('https://hufoot.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const events = await page.evaluate(() => {
            const results: any[] = [];
            const items = Array.from(document.querySelectorAll('a'));

            items.forEach((a, index) => {
                const text = a.innerText.trim();
                const href = a.getAttribute('href');
                if (!text || !href || href.length < 5) return;

                let sport = 'Other';
                let match = false;

                const lowerText = text.toLowerCase();
                if (lowerText.includes('motogp')) { sport = 'MotoGP'; match = true; }
                else if (lowerText.includes('tennis') || lowerText.includes('atp') || lowerText.includes('wta')) { sport = 'Tennis'; match = true; }
                else if (lowerText.includes('f1') || lowerText.includes('grand prix')) { sport = 'Formula 1'; match = true; }
                else if (lowerText.includes('ufc') || lowerText.includes('mma')) { sport = 'MMA'; match = true; }
                else if (lowerText.includes('boxing')) { sport = 'Boxing'; match = true; }

                if (!match) return;

                const isLive = lowerText.includes('live') || lowerText.includes('started') || lowerText.includes('now');

                results.push({
                    id: `hu_${index}_${Date.now()}`,
                    name: text,
                    commence_time: isLive ? 'Live' : 'Upcoming',
                    sport_key: sport.toLowerCase(),
                    sport_title: sport,
                    home_team: text,
                    away_team: isLive ? 'Live' : 'Scheduled',
                    league: {
                        id: 'hu_league',
                        name: sport,
                        sport: sport.toLowerCase(),
                        country: 'Unknown'
                    },
                    bookmakers: [],
                    streams: [],
                    url: href.startsWith('http') ? href : `https://hufoot.com${href}`,
                    source: 'Hufoot'
                });
            });
            return results;
        });

        await page.close();
        return Array.from(new Map(events.map((item: any) => [item.url, item])).values()) as Event[];
    } catch (error: any) {
        console.error('[Hufoot] Scrape Error:', error.message);
        return [];
    }
}

export async function getF1StreamsFreeStreams(url: string): Promise<StreamLink[]> {
    console.log(`[F1StreamsFree] Seeking streams: ${url}`);
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const streams = await page.evaluate(() => {
            const results: any[] = [];
            const iframes = Array.from(document.querySelectorAll('iframe'));
            iframes.forEach((ifr, i) => {
                const src = ifr.getAttribute('src');
                if (src && !src.includes('google') && !src.includes('ads')) {
                    results.push({
                        streamer: `F1 Server ${i + 1}`,
                        link_name: `Main Stream ${i + 1}`,
                        url: src,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 1,
                        language: 'EN'
                    });
                }
            });

            const links = Array.from(document.querySelectorAll('a[href*="player"], a[href*="stream"]'));
            links.forEach((l, i) => {
                const href = l.getAttribute('href');
                if (href && href.startsWith('http')) {
                    results.push({
                        streamer: `F1 Link ${i + 1}`,
                        link_name: (l as HTMLElement).innerText || `Mirror ${i + 1}`,
                        url: href,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 2,
                        language: 'EN'
                    });
                }
            });

            return results;
        });

        await page.close();
        return streams;
    } catch (error: any) {
        console.error('[F1StreamsFree] Stream Error:', error.message);
        return [];
    }
}

export async function getHufootStreams(url: string): Promise<StreamLink[]> {
    console.log(`[Hufoot] Seeking streams: ${url}`);
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const streams = await page.evaluate(() => {
            const results: any[] = [];
            const iframes = Array.from(document.querySelectorAll('iframe'));
            iframes.forEach((ifr, i) => {
                const src = ifr.getAttribute('src');
                if (src && !src.includes('ads') && !src.includes('facebook')) {
                    results.push({
                        streamer: 'Hufoot HD',
                        link_name: 'Direct Stream',
                        url: src,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 1,
                        language: 'Global'
                    });
                }
            });

            const buttons = Array.from(document.querySelectorAll('.btn, a.button, a[target="_blank"]'));
            buttons.forEach((btn, i) => {
                const href = btn.getAttribute('href');
                const text = (btn as HTMLElement).innerText.toLowerCase();
                if (href && (text.includes('stream') || text.includes('watch') || text.includes('live'))) {
                    results.push({
                        streamer: 'Hufoot Mirror',
                        link_name: (btn as HTMLElement).innerText || `Stream ${i + 1}`,
                        url: href.startsWith('http') ? href : window.location.origin + href,
                        mobile: 'yes',
                        quality: 'SD/HD',
                        ads: 2,
                        language: 'EN'
                    });
                }
            });

            return results;
        });

        await page.close();
        return streams;
    } catch (error: any) {
        console.error('[Hufoot] Stream Error:', error.message);
        return [];
    }
}
