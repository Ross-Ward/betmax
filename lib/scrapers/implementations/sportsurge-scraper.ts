import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';

const BASE_URL = 'https://sportsurge100.is';

export async function getSportSurgeEvents(): Promise<Event[]> {
    console.log('[SportSurge] Scraping events...');

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Import anti-detection utilities
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',  // Changed from networkidle2
            timeout: 12000  // Reduced from 60s to 12s
        });

        const events = await page.evaluate((baseUrl) => {
            const extracted: any[] = [];
            const leagueHeaders = document.querySelectorAll('.div-main-box .my-1');

            leagueHeaders.forEach(header => {
                const leagueName = (header.querySelector('span') as HTMLElement)?.innerText.trim() || 'Unknown';
                const leagueIcon = (header.querySelector('img') as HTMLImageElement)?.src || '';

                let currentElement = header.nextElementSibling;

                while (currentElement && !currentElement.classList.contains('my-1')) {
                    if (currentElement.tagName === 'A') {
                        const teams = currentElement.querySelectorAll('.txt-team');
                        if (teams.length >= 2) {
                            const homeTeam = (teams[0] as HTMLElement).innerText.trim();
                            const awayTeam = (teams[1] as HTMLElement).innerText.trim();
                            const timeStatus = (currentElement.querySelector('.time-txt span.text-dark-l span') as HTMLElement)?.innerText.trim() || '';
                            const url = (currentElement as HTMLAnchorElement).href;

                            let sport = 'Other';
                            const lowerLeague = leagueName.toLowerCase();
                            const lowerIcon = leagueIcon.toLowerCase();

                            if (lowerLeague.includes('nba') || lowerIcon.includes('basketball')) sport = 'Basketball';
                            else if (lowerLeague.includes('nfl') || lowerIcon.includes('football')) sport = 'American Football';
                            else if (lowerLeague.includes('hockey') || lowerLeague.includes('nhl') || lowerIcon.includes('hockey')) sport = 'NHL';
                            else if (lowerLeague.includes('soccer') || lowerLeague.includes('football') || lowerIcon.includes('soccer') ||
                                lowerLeague.includes('league') || lowerLeague.includes('liga') || lowerLeague.includes('serie a') ||
                                lowerLeague.includes('bundesliga') || lowerLeague.includes('cup')) sport = 'Soccer';
                            else if (lowerLeague.includes('ufc') || lowerLeague.includes('mma') || lowerIcon.includes('ufc') || lowerLeague.includes('wwe')) sport = 'MMA';
                            else if (lowerLeague.includes('boxing') || lowerIcon.includes('boxing')) sport = 'Boxing';
                            else if (lowerLeague.includes('tennis') || lowerIcon.includes('tennis')) sport = 'Tennis';
                            else if (lowerLeague.includes('f1') || lowerLeague.includes('grand prix')) sport = 'Formula 1';

                            extracted.push({
                                id: `ss_${homeTeam.toLowerCase().replace(/\s+/g, '')}_${awayTeam.toLowerCase().replace(/\s+/g, '')}`,
                                name: `${homeTeam} vs ${awayTeam}`,
                                commence_time: timeStatus,
                                sport_key: sport.toLowerCase(),
                                sport_title: sport,
                                home_team: homeTeam,
                                away_team: awayTeam,
                                league: {
                                    id: `sportsurge_${leagueName.toLowerCase().replace(/\s+/g, '_')}`,
                                    name: leagueName,
                                    sport: sport.toLowerCase(),
                                    country: 'Various',
                                    logo: leagueIcon
                                },
                                bookmakers: [],
                                url: url,
                                source: 'SportSurge',
                                images: []
                            });
                        }
                    }
                    currentElement = currentElement.nextElementSibling;
                }
            });

            return extracted;
        }, BASE_URL);

        await page.close();
        return events as Event[];

    } catch (error: any) {
        console.error('[SportSurge] Scrape failure:', error.message);
        return [];
    }
}

export async function getSportSurgeStreams(url: string): Promise<StreamLink[]> {
    console.log(`[SportSurge] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Import anti-detection utilities
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(url, {
            waitUntil: 'domcontentloaded',  // Changed from networkidle2
            timeout: 12000  // Reduced from 60s to 12s
        });

        const data = await page.evaluate(() => {
            const streams: any[] = [];
            const rows = document.querySelectorAll('tr#tr-round');

            rows.forEach(row => {
                const linkInput = row.querySelector('input[type="hidden"]') as HTMLInputElement;
                if (!linkInput) return;

                const tds = row.querySelectorAll('td');
                if (tds.length < 7) return;

                const name = (tds[1] as HTMLElement).innerText.trim();
                const reputation = (tds[2].querySelector('a, span') as HTMLElement)?.innerText.trim() || '';
                const quality = (tds[3].querySelector('a, span') as HTMLElement)?.innerText.trim() || '';
                const language = (tds[4].querySelector('a, span') as HTMLElement)?.innerText.trim() || '';
                const adsText = (tds[5].querySelector('a, span') as HTMLElement)?.innerText.trim() || '0';
                const channel = (tds[6].querySelector('a, span') as HTMLElement)?.innerText.trim() || '';

                streams.push({
                    streamer: name,
                    link_name: channel || name,
                    url: linkInput.value,
                    mobile: 'yes',
                    quality: quality,
                    ads: parseInt(adsText) || 0,
                    language: language,
                    note: `Reputation: ${reputation}`
                });
            });

            return streams;
        });

        await page.close();
        return data as StreamLink[];

    } catch (error: any) {
        console.error('[SportSurge] Stream scrape failure:', error.message);
        return [];
    }
}
