import { Event } from '../types';
import { getRealisticTeams } from '../data/simulated-names';

const SPORT_MAPPING: Record<string, { url: string; title: string }> = {
    soccer: { url: 'https://www.oddsportal.com/soccer/', title: 'Soccer' },
    nfl: { url: 'https://www.oddsportal.com/american-football/usa/nfl/', title: 'NFL' },
    nhl: { url: 'https://www.oddsportal.com/hockey/usa/nhl/', title: 'NHL' },
    baseball: { url: 'https://www.oddsportal.com/baseball/usa/mlb/', title: 'MLB' },
    basketball: { url: 'https://www.oddsportal.com/basketball/usa/nba/', title: 'NBA' },
    cricket: { url: 'https://www.oddsportal.com/cricket/', title: 'Cricket' },
    boxing: { url: 'https://www.oddsportal.com/boxing/', title: 'Boxing' },
    ufc: { url: 'https://www.oddsportal.com/mma/', title: 'UFC' },
    golf: { url: 'https://www.oddsportal.com/golf/', title: 'Golf' },
    horse: { url: 'https://www.oddsportal.com/horse-racing/', title: 'Horse Racing' },
    dogs: { url: 'https://www.oddsportal.com/greyhounds/', title: 'Greyhounds' },
};

import { Browser } from 'puppeteer';

export async function scrapeBettingOdds(sportKey: string = 'soccer', existingBrowser?: Browser): Promise<Event[]> {
    console.log(`[BETTING SCRAPER] Scanning ${sportKey}...`);
    const sportInfo = SPORT_MAPPING[sportKey] || SPORT_MAPPING.soccer;

    let browser = existingBrowser;
    let ownBrowser = false;

    try {
        if (!browser) {
            const { default: puppeteer } = await import('puppeteer');
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
            ownBrowser = true;
        }

        const page = await browser.newPage();

        // Import anti-detection utilities
        const { getRandomUserAgent, getRandomHeaders } = await import('./scraper-utils');

        // Set randomized user agent
        await page.setUserAgent(getRandomUserAgent());

        // Set randomized headers
        const headers = getRandomHeaders();
        await page.setExtraHTTPHeaders(headers);

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font', 'media', 'stylesheet'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        try {
            await page.goto(sportInfo.url, {
                waitUntil: 'domcontentloaded',
                timeout: 15000  // Reduced from 30s to 15s
            });

            // Wait specifically for the table or matches
            try {
                await page.waitForSelector('div.group.flex, .eventRow', { timeout: 10000 });
            } catch (e) {
                // If main selector fails, it might be empty or different structure, check for "no matches" msg or just continue
            }

            const events = await page.evaluate((sportTitle, sportKey) => {
                const results: any[] = [];
                // Look for both new and old OddsPortal selectors
                const rows = Array.from(document.querySelectorAll('div.group.flex, div.flex.gap-1, .eventRow'));

                let currentLeague = 'Generic';
                let currentCountry = 'World';

                rows.slice(0, 50).forEach((row, index) => {
                    try {
                        // Header detection (Country/League)
                        if (row.classList.contains('gap-1') || row.querySelector('.text-xs.font-normal')) {
                            const countryLink = row.querySelector('a:nth-child(2)');
                            const leagueLink = row.querySelector('a:last-child');

                            if (countryLink && leagueLink) {
                                currentCountry = countryLink.textContent?.trim() || currentCountry;
                                currentLeague = leagueLink.textContent?.trim() || currentLeague;
                            }
                            return;
                        }

                        // Match Row Extraction
                        // Check for team names
                        const teamElements = row.querySelectorAll('.participant-name a, a[title] p, .team-name');
                        if (teamElements.length < 2) return;

                        const home = teamElements[0].textContent?.trim() || 'Home';
                        const away = teamElements[1].textContent?.trim() || 'Away';

                        if (home === 'Home' || away === 'Away') return;

                        // Time and Status
                        const timeEl = row.querySelector('.flex-col p, .time, .flex.items-center.gap-1.text-xs');
                        let time = timeEl?.textContent?.trim() || 'Live';

                        // Detect if finished (often contains a score or 'Finished')
                        const isFinished = time.toLowerCase().includes('fin') ||
                            time.toLowerCase().includes('canc') ||
                            row.querySelector('.font-bold.text-black-main') !== null; // Score indicator

                        if (isFinished) return;

                        // Odds
                        const outcomes = [];
                        // Trying to find odds buttons/cells. They often change classes so we look for structure.
                        const oddsCells = Array.from(row.querySelectorAll('.odds, .height-content, .bg-gray-light'));

                        // Parse simple 1x2 if available
                        const parseOdd = (txt: string) => {
                            const val = parseFloat(txt.replace(/[^0-9.]/g, ''));
                            return isNaN(val) ? 0 : val;
                        };

                        if (oddsCells.length >= 3) {
                            // Assuming 1 X 2 order
                            const o1 = parseOdd(oddsCells[0].textContent || '');
                            const oX = parseOdd(oddsCells[1].textContent || '');
                            const o2 = parseOdd(oddsCells[2].textContent || '');

                            if (o1) outcomes.push({ name: '1', price: o1 });
                            if (oX) outcomes.push({ name: 'X', price: oX });
                            if (o2) outcomes.push({ name: '2', price: o2 });
                        } else if (oddsCells.length >= 2) {
                            // Moneyline for US Sports (NFL, NHL, NBA)
                            const o1 = parseOdd(oddsCells[0].textContent || '');
                            const o2 = parseOdd(oddsCells[1].textContent || '');
                            if (o1) outcomes.push({ name: '1', price: o1 });
                            if (o2) outcomes.push({ name: '2', price: o2 });
                        }

                        if (outcomes.length > 0) {
                            results.push({
                                id: `bet_${sportKey}_${index}_${Math.random().toString(36).substr(2, 5)}`,
                                name: `${home} vs ${away}`,
                                sport_key: sportKey,
                                sport_title: sportTitle,
                                commence_time: time,
                                home_team: home,
                                away_team: away,
                                league: {
                                    id: `l_${currentLeague.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                                    name: currentLeague,
                                    sport: sportTitle,
                                    country: currentCountry
                                },
                                bookmakers: [{
                                    key: 'oddsportal',
                                    title: 'OddsPortal',
                                    last_update: new Date().toISOString(),
                                    markets: [{
                                        key: 'h2h',
                                        last_update: new Date().toISOString(),
                                        outcomes: outcomes
                                    }]
                                }],
                                source: 'OddsPortal'
                            });
                        }

                    } catch (e) { }
                });
                return results;
            }, sportInfo.title, sportKey);

            return events;

        } catch (e) {
            console.warn(`[SCRAPER] Page load issue for ${sportKey}:`, e);
            return [];
        } finally {
            await page.close();
        }

    } catch (error) {
        console.error(`[BETTING SCRAPER] Critical Error for ${sportKey}:`, error);
        return [];
    } finally {
        if (ownBrowser && browser) {
            await browser.close();
        }
    }
}

export async function getAllBettingOdds(): Promise<Event[]> {
    const sports = Object.keys(SPORT_MAPPING);
    let browser;
    const allEvents: Event[] = [];

    try {
        console.log('[MASTER SCRAPER] Launching shared browser...');
        const { default: puppeteer } = await import('puppeteer');
        const { randomSleep } = await import('./scraper-utils');

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        // Process strictly sequentially to avoid CPU spikes
        for (const sport of sports) {
            // Add random delay between requests (500ms-2s)
            await randomSleep(500, 2000);

            try {
                const events = await scrapeBettingOdds(sport, browser);
                if (events.length > 0) {
                    console.log(`[MASTER SCRAPER] Got ${events.length} events for ${sport}`);
                    allEvents.push(...events);
                }
            } catch (error) {
                console.error(`[MASTER SCRAPER] Failed to scrape ${sport}:`, error);
                // Continue with next sport instead of failing completely
            }
        }
    } catch (e) {
        console.error('[MASTER SCRAPER] Batch process failed:', e);
    } finally {
        if (browser) {
            console.log('[MASTER SCRAPER] Closing browser.');
            await browser.close();
        }
    }

    return allEvents;
}
