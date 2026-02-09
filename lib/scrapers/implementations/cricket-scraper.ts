import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';
import { BaseScraper } from '../core/base-scraper';

const BASE_URL = 'https://www.espncricinfo.com';

export async function getCricketEvents(): Promise<Event[]> {
    console.log('[Cricket] Scraping ESPNcricinfo events...');
    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to live cricket scores page
        await page.goto(`${BASE_URL}/live-cricket-score`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Wait for match cards to load
        await page.waitForSelector('div.ds-px-4.ds-py-3', { timeout: 15000 }).catch(async () => {
            console.log('[Cricket] Timeout waiting for match cards, proceeding with what we have...');
            const html = await page.content();
            const fs = require('fs');
            fs.writeFileSync('cricinfo_debug.html', html);
            console.log('[Cricket] Saved debug HTML to cricinfo_debug.html');
        });

        const events = await page.evaluate((baseUrl) => {
            const results: any[] = [];
            const matchCards = document.querySelectorAll('div.ds-px-4.ds-py-3');

            matchCards.forEach((card, index) => {
                try {
                    // Extract link
                    const anchor = card.querySelector('a');
                    const href = anchor ? anchor.getAttribute('href') : null;
                    const url = href ? (href.startsWith('http') ? href : `${baseUrl}${href}`) : baseUrl;

                    // Extract Teams
                    const teamElements = card.querySelectorAll('div.ci-team-score p.ds-text-tight-m');
                    if (teamElements.length < 2) return; // Not a valid match card

                    const home = teamElements[0].textContent?.trim() || 'Team A';
                    const away = teamElements[1].textContent?.trim() || 'Team B';

                    // Extract Status
                    const statusEl = card.querySelector('span.ds-text-tight-xs.ds-font-medium.ds-uppercase');
                    const statusText = statusEl?.textContent?.trim().toUpperCase() || '';

                    const noteEl = card.querySelector('p.ds-text-tight-s');
                    const noteText = noteEl?.textContent?.trim() || '';

                    let status = 'Upcoming';
                    if (statusText === 'RESULT') {
                        // Skip results
                        return;
                    } else if (statusText === 'LIVE' || statusText === 'STUMPS' || statusText === 'INNINGS BREAK' || statusText === 'TEA' || statusText === 'LUNCH') {
                        status = 'Live';
                    } else if (noteText.includes('Match starts') || statusText.includes('TOMORROW') || statusText.includes('TODAY')) {
                        status = 'Upcoming';
                    } else {
                        // Default to upcoming/scheduled if unsure, or Live if it has scores
                        const hasScores = card.querySelectorAll('strong').length > 0;
                        if (hasScores) status = 'Live';
                    }

                    results.push({
                        id: `cric_${index}_${Date.now()}`,
                        name: `${home} vs ${away}`,
                        sport_key: 'cricket',
                        sport_title: 'Cricket',
                        commence_time: status,
                        home_team: home,
                        away_team: away,
                        league: {
                            id: 'international_cricket',
                            name: 'International & Domestic Cricket',
                            sport: 'Cricket',
                            country: 'World'
                        },
                        bookmakers: [],
                        streams: [],
                        url: url,
                        source: 'ESPNcricinfo',
                        images: []
                    });
                } catch (e) {
                    // Silent catch
                }
            });

            // Remove duplicates
            return results.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        }, BASE_URL);

        await page.close();
        return events as Event[];

    } catch (error: any) {
        console.error('[Cricket] Scrape error:', error.message);
        return [];
    }
}

export async function getCricketStreams(url: string): Promise<StreamLink[]> {
    // Cricinfo doesn't provide illegal streams, so we return empty.
    // In future, we could scrape 'watch links' if they add them, or link to official broadcasters.
    return [];
}
