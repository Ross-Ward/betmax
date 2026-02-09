import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';
import { BaseScraper } from '../core/base-scraper';
import { CompetitionTable, DataEvent } from '../../types/data-schema';

import { getStreamEastEvents } from './streameast-scraper';

export async function getNBAEvents(): Promise<Event[]> {
    console.log('[NBABite] Delegating to StreamEast scraper...');
    try {
        const allEvents = await getStreamEastEvents();
        return allEvents.filter(e => e.sport_key === 'basketball' || e.sport_title.toLowerCase().includes('nba'));
    } catch (error: any) {
        console.error('[NBABite] Scrape error:', error.message);
        return [];
    }
}

export async function getNBAStreams(url: string): Promise<StreamLink[]> {
    console.log(`[NBABite] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const streams = await page.evaluate(() => {
            const results: any[] = [];
            const streamElements = Array.from(document.querySelectorAll(
                'a[href*="stream"], .stream-link, .link-button, [class*="stream"]'
            ));

            streamElements.forEach((elem, index) => {
                const anchor = elem.tagName === 'A' ? elem : elem.querySelector('a');
                if (!anchor) return;

                const url = anchor.getAttribute('href');
                if (!url) return;

                const text = (elem as HTMLElement).innerText.trim();
                const quality = text.match(/HD|SD|4K|1080p|720p/i)?.[0] || 'HD';
                const language = text.match(/English|Spanish|French|German/i)?.[0] || 'English';

                results.push({
                    streamer: `NBABite Stream ${index + 1}`,
                    link_name: text || `Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://www.nbabite.is${url}`,
                    mobile: 'yes',
                    quality: quality,
                    ads: 2,
                    language: language
                });
            });

            return results;
        });

        await page.close();
        return streams as StreamLink[];

    } catch (error: any) {
        console.error('[NBABite] Stream scrape error:', error.message);
        return [];
    }
}

export class NBAScraper extends BaseScraper<{ table: CompetitionTable, events: DataEvent[] }> {
    constructor() {
        super('https://www.espn.com/nba/standings', 'basketball');
    }

    async scrape(): Promise<{ table: CompetitionTable, events: DataEvent[] }> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            console.log(`[NBA SCRAPER] Extracting Standings...`);
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.goto(this.sourceUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });

            const table = await page.evaluate(() => {
                const entries: any[] = [];
                const rows = Array.from(document.querySelectorAll('.Table__TBODY tr'));

                rows.forEach((row, index) => {
                    const teamNameEl = row.querySelector('.team-names');
                    if (!teamNameEl) return;

                    const name = teamNameEl.textContent?.trim() || 'Unknown';
                    const stats = Array.from(row.querySelectorAll('.Table__TD')).map(td => td.textContent?.trim());

                    if (stats.length >= 2) {
                        const won = parseInt(stats[0]) || 0;
                        const lost = parseInt(stats[1]) || 0;

                        entries.push({
                            participant_id: `nba_${name.toLowerCase().replace(/\s+/g, '_')}`,
                            participant_name: name,
                            played: won + lost,
                            won,
                            lost,
                            points: won,
                            form: []
                        });
                    }
                });

                return {
                    id: 'nba_standings',
                    season_id: 'nba_2025',
                    entries,
                    last_updated: new Date().toISOString()
                };
            });

            await page.close();
            return { table: table as CompetitionTable, events: [] };
        } catch (error: any) {
            console.error(`[NBA SCRAPER] Error: ${error.message}`);
            if (page) await page.close().catch(() => { });
            return this.getSimulationData();
        }
    }

    getSimulationData(): { table: CompetitionTable, events: DataEvent[] } {
        return {
            table: { id: 'nba_standings', season_id: 'nba_2025', entries: [], last_updated: new Date().toISOString() },
            events: []
        };
    }
}
