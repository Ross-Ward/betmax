import puppeteer from 'puppeteer';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ArbitrageOpportunity } from '../scraper-types';

// puppeteer.use(StealthPlugin());

export async function scrapeOddspedia(): Promise<ArbitrageOpportunity[]> {
    console.log('Starting Oddspedia Scraper (Interactive Mode)...');

    // Launch visible browser
    // @ts-ignore
    const browser = await puppeteer.launch({
        headless: false, // User can see and interact
        defaultViewport: null,
        args: ['--start-maximized'] // Open full screen
    });

    try {
        const page = await browser.newPage();
        await page.goto('https://oddspedia.com/sure-bets', {
            waitUntil: 'domcontentloaded',
            timeout: 0 // No timeout, wait for user
        });

        // Wait for user to bypass Cloudflare
        // We'll wait for a specific element that exists ONLY on the real page, not the captcha
        console.log('Waiting for user to solve CAPTCHA...');

        // Wait for the "Sure Bets" header or table
        await page.waitForSelector('h1', { timeout: 0 }); // Wait indefinitely for user

        // Once loaded, scrape data
        const opportunities = await page.evaluate(() => {
            const results: any[] = [];

            // Oddspedia structure (Approximate based on typical layout)
            // Looking for table rows
            const rows = Array.from(document.querySelectorAll('div.sure-bets-box'));

            rows.forEach((row, index) => {
                try {
                    // Extract Profit
                    // Structure is usually complex, simplifying for resilience
                    const text = (row as HTMLElement).innerText;
                    const profitMatch = text.match(/([0-9]+\.[0-9]+)%/);
                    const profit = profitMatch ? parseFloat(profitMatch[1]) : 0;

                    if (profit > 0) {
                        results.push({
                            id: `od_${index}_${Date.now()}`,
                            sport: 'Sports',
                            league: 'Oddspedia League',
                            event: text.split('\n')[0] || 'Event',
                            time: 'Upcoming',
                            market: 'Sure Bet',
                            profit_percentage: profit,
                            bookmakers: [],
                            fetched_at: new Date().toISOString(),
                            source: 'oddspedia'
                        });
                    }
                } catch (e) { }
            });
            return results;
        });

        return opportunities as ArbitrageOpportunity[];

    } catch (error) {
        console.error('Oddspedia Scrape Error:', error);
        return [];
    } finally {
        // Don't close immediately in debug mode? 
        // Or close so API returns?
        // Let's close after 5 seconds to show it's done
        await new Promise(r => setTimeout(r, 5000));
        await browser.close();
    }
}
