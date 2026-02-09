import { getBrowser } from './browser-manager';
import { Event, StreamLink } from '@/lib/types';

const BASE_DOMAIN = 'totalsportek.army';
const URLS = [
    { url: `https://${BASE_DOMAIN}`, sport: 'Football' },
    { url: `https://www.totalsportek.army/category/nba`, sport: 'Basketball' },
    { url: `https://www.totalsportek.army/category/nfl`, sport: 'American Football' },
    { url: `https://www.totalsportek.army/category/f1`, sport: 'Formula 1' },
    { url: `https://www.totalsportek.army/category/ufc`, sport: 'MMA' },
    { url: `https://www.totalsportek.army/category/boxing`, sport: 'Boxing' },
];


export async function getLiveEvents(): Promise<Event[]> {
    console.log('[Totalsportek] Scraping Multi-Category...');

    const browser = await getBrowser();

    try {
        const results = await Promise.all(URLS.map(async (source) => {
            let page;
            try {
                page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // Rapid navigate
                await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                const events = await page.evaluate((sportTitle, domain) => {
                    const extracted: any[] = [];
                    const anchors = Array.from(document.querySelectorAll('a[href*="/game/"]'));

                    anchors.forEach((a, index) => {
                        const text = (a as HTMLElement).innerText.trim();
                        if (!text) return;

                        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

                        let time = 'Upcoming';
                        let team1 = 'Unknown Team 1';
                        let team2 = 'Unknown Team 2';

                        if (lines.length >= 3) {
                            time = lines[0];
                            team1 = lines[1];
                            team2 = lines[2];
                        } else if (lines.length === 2) {
                            time = lines[0];
                            const teams = lines[1].split(' vs ');
                            team1 = teams[0];
                            team2 = teams[1] || '';
                        }

                        if (text.toLowerCase().includes('match started')) {
                            time = 'Match Started';
                        }

                        if (team1.includes('Unknown') || team2.includes('Unknown')) return;

                        const href = a.getAttribute('href');
                        if (!href) return;

                        extracted.push({
                            id: `ts_${sportTitle}_${index}_${Math.floor(Math.random() * 1000)}`,
                            name: `${team1} vs ${team2}`,
                            commence_time: time,
                            sport_key: sportTitle.toLowerCase(),
                            sport_title: sportTitle,
                            home_team: team1,
                            away_team: team2,
                            league: {
                                id: 'ts_league',
                                name: sportTitle,
                                sport: sportTitle.toLowerCase(),
                                country: 'Unknown'
                            },
                            bookmakers: [],
                            streams: [],
                            url: href.startsWith('http') ? href : `https://${domain}${href}`,
                            source: 'Totalsportek'
                        });
                    });
                    return extracted;
                }, source.sport, BASE_DOMAIN);

                await page.close();
                return events;
            } catch (err: any) {
                console.error(`[Totalsportek] Error on ${source.url}:`, err.message);
                if (page) await page.close().catch(() => { });
                return [];
            }
        }));

        const allEvents = results.flat();
        const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.url, item])).values());

        return uniqueEvents as Event[];
    } catch (error) {
        console.error('[Totalsportek] Global Scrape Error:', error);
        return [];
    }
}

export async function getEventStreams(url: string): Promise<StreamLink[]> {
    console.log(`[Totalsportek] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const streams = await page.evaluate(() => {
            const results: any[] = [];
            const rows = Array.from(document.querySelectorAll('.data-row'));

            rows.forEach(row => {
                const anchor = row.querySelector('a');
                if (!anchor) return;

                const url = anchor.getAttribute('href');
                if (!url) return;

                const cols = Array.from(anchor.querySelectorAll('.row > div'));
                if (cols.length < 6) return;

                const streamer = (cols[0] as HTMLElement).innerText.trim().replace(/\s+/g, ' ');
                const link_name = (cols[1] as HTMLElement).innerText.trim();
                const mobile = (cols[2] as HTMLElement).innerText.trim().toLowerCase();
                const quality = (cols[3] as HTMLElement).innerText.trim();
                const adsText = (cols[4] as HTMLElement).innerText.trim();
                const ads = parseInt(adsText) || 0;
                const language = (cols[5] as HTMLElement).innerText.trim();

                results.push({
                    streamer,
                    link_name,
                    url,
                    mobile,
                    quality,
                    ads,
                    language
                });
            });

            return results;
        });

        await page.close();
        return streams as StreamLink[];
    } catch (error) {
        console.error('[Totalsportek] Stream Scrape Error:', error);
        return [];
    }
}
