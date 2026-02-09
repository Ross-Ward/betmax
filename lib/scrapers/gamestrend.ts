import { getBrowser } from './browser-manager';
import { Event, StreamLink } from '@/lib/types';

const GAMESTREND_URL = 'https://gamestrend.net';

export async function getGamestrendEvents(): Promise<Event[]> {
    console.log('[Gamestrend] Scraping Events...');

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(`${GAMESTREND_URL}/daily-event`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const events = await page.evaluate(() => {
            const results: any[] = [];

            const eventCards = Array.from(document.querySelectorAll('.event-card, .match-item, tr'));

            eventCards.forEach((card, index) => {
                const text = (card as HTMLElement).innerText;
                if (!text.includes('vs') && !text.includes(' v ')) return;

                const link = card.querySelector('a')?.getAttribute('href');
                if (!link) return;

                const lines = text.split('\n').filter(l => l.trim().length > 0);

                let time = 'Live/Upcoming';
                let title = 'Unknown Match';
                let sport = 'General';

                if (text.toLowerCase().includes('boxing')) sport = 'Boxing';
                else if (text.toLowerCase().includes('ufc') || text.toLowerCase().includes('mma')) sport = 'MMA';
                else if (text.toLowerCase().includes('nba')) sport = 'Basketball';
                else if (text.toLowerCase().includes('nfl')) sport = 'American Football';
                else if (text.toLowerCase().includes('soccer') || text.toLowerCase().includes('premier league')) sport = 'Football';
                else if (text.toLowerCase().includes('cricket')) sport = 'Cricket';

                if (lines.length > 0) {
                    const matchLine = lines.find(l => l.toLowerCase().includes('vs') || l.toLowerCase().includes(' v '));
                    if (matchLine) title = matchLine;
                    else title = lines[0];

                    const timeLine = lines.find(l => l.match(/\d{1,2}:\d{2}/));
                    if (timeLine) time = timeLine;
                }

                const teams = title.split(/ vs | v /i);
                const home = teams[0]?.trim() || 'Team A';
                const away = teams[1]?.trim() || 'Team B';

                if (home === 'Team A' || title === 'Unknown Match') return;

                results.push({
                    id: `gt_${index}_${Date.now()}`,
                    name: title,
                    commence_time: time === 'Live/Upcoming' ? 'Scheduled' : time,
                    sport_key: sport.toLowerCase(),
                    sport_title: sport,
                    home_team: home,
                    away_team: away,
                    league: {
                        id: 'gt_all',
                        name: 'Gamestrend Event',
                        sport: sport.toLowerCase(),
                        country: 'Unknown'
                    },
                    bookmakers: [],
                    streams: [],
                    url: link,
                    source: 'Gamestrend'
                });
            });

            return results;
        });

        await page.close();
        return events as Event[];
    } catch (error: any) {
        console.error('[Gamestrend] Scrape Error:', error.message);
        return [];
    }
}

export async function getGamestrendStreams(url: string): Promise<StreamLink[]> {
    console.log(`[Gamestrend] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const streamUrl = await page.evaluate(() => {
            const iframe = document.querySelector('iframe');
            return iframe ? iframe.src : null;
        });

        await page.close();

        if (!streamUrl) return [];

        return [{
            streamer: 'Gamestrend',
            link_name: 'Main Stream',
            url: streamUrl,
            mobile: 'yes',
            quality: 'HD',
            ads: 1,
            language: 'EN'
        }];

    } catch (error: any) {
        console.error('[Gamestrend] Stream Error:', error.message);
        return [];
    }
}
