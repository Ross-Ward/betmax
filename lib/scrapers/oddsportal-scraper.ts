import puppeteer from 'puppeteer';
import { getRealisticTeams } from '../data/simulated-names';
import { ArbitrageOpportunity } from '../scraper-types';
import { Event } from '@/lib/types';

export async function getRecommendedEvents(): Promise<Event[]> {
    console.log('Scraping Oddsportal Recommended Events...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Go to matches page
        await page.goto('https://www.oddsportal.com/matches/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Wait for rows
        try {
            await page.waitForSelector('div.group.flex', { timeout: 15000 });
        } catch (e) {
            console.log("Timeout waiting for game rows");
        }

        const events = await page.evaluate(() => {
            const results: any[] = [];
            const rows = Array.from(document.querySelectorAll('div.group.flex'));

            rows.slice(0, 15).forEach((row, index) => {
                try {
                    const teamParas = Array.from(row.querySelectorAll('a[title] p'));
                    if (teamParas.length < 2) return; // Skip if no real teams found

                    const home = teamParas[0].textContent?.trim() || 'Home';
                    const away = teamParas[1].textContent?.trim() || 'Away';

                    if (home === 'Home' || away === 'Away') return;

                    // Time
                    const timeEl = row.querySelector('a p');
                    let time = 'Upcoming';
                    if (timeEl) time = timeEl.textContent?.trim() || 'Upcoming';

                    // Odds
                    const directChildren = Array.from(row.children);
                    const outcomes = [];

                    const parseOdd = (text?: string) => {
                        if (!text) return 0;
                        if (text.includes('/')) {
                            const [n, d] = text.split('/').map(Number);
                            return 1 + (n / d);
                        }
                        return parseFloat(text.replace(/[^\d.]/g, '')) || 0;
                    };

                    if (directChildren.length >= 4) {
                        const price1 = parseOdd(directChildren[1].textContent || '');
                        const priceX = parseOdd(directChildren[2].textContent || '');
                        const price2 = parseOdd(directChildren[3].textContent || '');

                        if (price1 > 0) outcomes.push({ name: 'Home', price: price1 });
                        if (priceX > 0) outcomes.push({ name: 'Draw', price: priceX });
                        if (price2 > 0) outcomes.push({ name: 'Away', price: price2 });
                    }

                    // Construct Event
                    if (outcomes.length >= 2) {
                        results.push({
                            id: `op_${index}_${Math.random().toString(36).substr(2, 9)}`,
                            name: `${home} vs ${away}`,
                            sport_key: 'soccer_2526',
                            sport_title: 'Soccer',
                            commence_time: time,
                            home_team: home,
                            away_team: away,
                            league: {
                                id: 'op_league_2526',
                                name: 'Top Markets 25/26',
                                sport: 'Soccer',
                                country: 'Europe'
                            },
                            bookmakers: [{
                                key: 'oddsportal',
                                title: 'OddsPortal',
                                last_update: new Date().toISOString(),
                                markets: [{
                                    key: 'h2h',
                                    last_update: new Date().toISOString(),
                                    outcomes
                                }]
                            }],
                            streams: [],
                            source: 'Oddsportal'
                        });
                    }

                } catch (e) { }
            });
            return results;
        });

        return events as Event[];

    } catch (error) {
        console.error('Oddsportal Scraper Error:', error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}
