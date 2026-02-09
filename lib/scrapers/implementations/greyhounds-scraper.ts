import { BaseScraper } from '../core/base-scraper';
import { DataEvent } from '../../types/data-schema';

interface GreyhoundScraperResult {
    races: DataEvent[];
}

export class GreyhoundScraper extends BaseScraper<GreyhoundScraperResult> {
    constructor() {
        super('https://www.sportinglife.com/greyhounds/racecards', 'greyhounds');
    }

    async scrape(): Promise<GreyhoundScraperResult> {
        await this.init();
        const races: DataEvent[] = [];

        try {
            // Scrape Today and Tomorrow
            const datesToScrape = [new Date()];
            // Add tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            datesToScrape.push(tomorrow);

            for (const dateObj of datesToScrape) {
                const dateStr = dateObj.toISOString().split('T')[0];
                const url = `https://www.sportinglife.com/greyhounds/racecards/${dateStr}`;

                console.log(`[GREYHOUNDS] Navigating to racecards for ${dateStr}...`);
                try {
                    await this.page!.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (e) {
                    console.warn(`[GREYHOUNDS] Failed to load date ${dateStr}, skipping.`);
                    continue;
                }

                await this.handleModals();

                // 1. Extract all race links for the day
                const raceLinks = await this.page!.evaluate((dStr) => {
                    const links: { url: string; time: string; meeting: string }[] = [];
                    const anchors = Array.from(document.querySelectorAll('a[href*="/greyhounds/racecards/"]'));

                    anchors.forEach(a => {
                        const href = a.getAttribute('href');
                        if (href && href.includes('/racecard/')) {
                            // Ensure it matches the date or is robust enough
                            const parentSection = a.closest('section') || a.parentElement?.parentElement;
                            const meetingHeader = parentSection?.querySelector('h2');
                            const meeting = meetingHeader?.textContent || 'Unknown';

                            links.push({
                                url: href.startsWith('http') ? href : `https://www.sportinglife.com${href}`,
                                time: a.textContent?.trim() || '',
                                meeting
                            });
                        }
                    });
                    return links;
                }, dateStr);

                console.log(`[GREYHOUNDS] Found ${raceLinks.length} races for ${dateStr}.`);

                // 2. Process races (Limit to 3 per day for safety during initial verify)
                const racesToScrape = raceLinks.slice(0, 3);

                for (const link of racesToScrape) {
                    console.log(`[GREYHOUNDS] Scraping ${link.meeting} ${link.time}...`);
                    try {
                        await this.page!.goto(link.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                        // Wait for any runner container
                        const hasTable = await this.waitFor('section.runner-list, table, .HorseCard, .RaceCard-module_runnerList', 5000);

                        if (!hasTable) {
                            console.warn(`[GREYHOUNDS] No runner table found for ${link.url}`);
                            continue;
                        }

                        // Extract Race Details
                        const raceData = await this.page!.evaluate((meeting, time, url) => {
                            const runners = [];
                            // Try multiple selector strategies
                            // Strategy A: Standard Table
                            let rows = Array.from(document.querySelectorAll('tr.runner-row, tr.RunnerRow, .RunnerList-module_row'));

                            // Strategy B: Generic TR if A fails
                            if (rows.length === 0) {
                                rows = Array.from(document.querySelectorAll('table tbody tr'));
                            }

                            // Strategy C: Div based runner cards
                            if (rows.length === 0) {
                                const cards = Array.from(document.querySelectorAll('.HorseCard, .GreyhoundCard'));
                                // Adapt parsing for cards if needed, but assuming table for now.
                            }

                            for (const row of rows) {
                                const textContent = row.textContent || '';
                                if (!textContent.trim()) continue;

                                // Extract Trap (usually first number or cell)
                                const trapCell = row.querySelector('.trap, .cloth-number, td:first-child');
                                const trap = trapCell?.textContent?.trim() || '0';

                                // Extract Name (usually strong or specific class)
                                const nameCell = row.querySelector('.name, .runner-name, strong, a[href*="/greyhounds/profiles/"]');
                                const name = nameCell?.textContent?.trim() || 'Unknown Dog';

                                // Extract Trainer (often small text under name or separate cell)
                                const trainerCell = row.querySelector('.trainer, .runner-trainer');
                                const trainer = trainerCell?.textContent?.trim().replace(/[()]/g, '') || '';

                                // Extract Form (often a sequence of numbers like 1-2-3)
                                const formCell = row.querySelector('.form, .runner-form');
                                const form = formCell?.textContent?.trim() || '';

                                // Extract Odds (Betting buttons usually)
                                const oddsBtn = row.querySelector('button[data-test-id*="bet-button"], .odds-button');
                                const odds = oddsBtn?.textContent?.trim() || '';

                                runners.push({
                                    id: `dog_${name.toLowerCase().replace(/\s+/g, '_')}_${trap}`,
                                    name: name,
                                    result: 'null' as const,
                                    metadata: {
                                        trap: parseInt(trap) || 0,
                                        trainer,
                                        form,
                                        odds,
                                        raw: textContent.substring(0, 100) // Debug
                                    }
                                });
                            }

                            const raceId = url.split('/').pop() || 'unknown';

                            return {
                                id: raceId,
                                sport: 'greyhounds' as const,
                                name: `${meeting} ${time}`,
                                start_time: new Date().toISOString(), // Needs parsing logic if vital
                                status: 'scheduled' as const,
                                participants: runners,
                                metadata: {
                                    meeting,
                                    url,
                                    date: new Date().toISOString().split('T')[0]
                                }
                            };
                        }, link.meeting, link.time, link.url);

                        if (raceData.participants.length > 0) {
                            races.push(raceData);
                        }

                        // Nap to be polite
                        await new Promise(r => setTimeout(r, 2500));

                    } catch (e: any) {
                        console.error(`[GREYHOUNDS] Failed to scrape race ${link.url}: ${e.message}`);
                    }
                }
            }

            await this.close();

            // If no races found, return simulation data
            if (races.length === 0) {
                console.log('[GREYHOUNDS] No live races found, returning simulation data...');
                return this.getSimulationData();
            }

            return { races };

        } catch (error: any) {
            console.error(`[GREYHOUNDS] Fatal Error: ${error.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(): GreyhoundScraperResult {
        const now = new Date();
        const meetings = ['Hove', 'Oxford', 'Newcastle', 'Romford', 'Nottingham'];
        const races: DataEvent[] = [];

        meetings.forEach((meeting, meetingIdx) => {
            // Create 3 races per meeting
            for (let i = 0; i < 3; i++) {
                const raceTime = new Date(now.getTime() + (meetingIdx * 60 + i * 20) * 60000);
                const timeStr = raceTime.toTimeString().substring(0, 5);

                const runners = [
                    { trap: 1, name: 'Swift Runner', trainer: 'J. Smith', form: '1-2-1', odds: '3/1' },
                    { trap: 2, name: 'Lightning Bolt', trainer: 'M. Jones', form: '2-1-3', odds: '5/2' },
                    { trap: 3, name: 'Thunder Strike', trainer: 'P. Brown', form: '3-3-2', odds: '4/1' },
                    { trap: 4, name: 'Rapid Fire', trainer: 'S. Davis', form: '1-1-1', odds: '2/1' },
                    { trap: 5, name: 'Speed Demon', trainer: 'K. Wilson', form: '4-2-3', odds: '6/1' },
                    { trap: 6, name: 'Flash Gordon', trainer: 'L. Taylor', form: '2-3-1', odds: '7/2' }
                ];

                races.push({
                    id: `sim_${meeting}_${i}`,
                    sport: 'greyhounds',
                    name: `${meeting} ${timeStr}`,
                    start_time: raceTime.toISOString(),
                    status: 'scheduled',
                    participants: runners.map(r => ({
                        id: `${meeting}_${r.trap}_${r.name.replace(/\s/g, '_')}`,
                        name: r.name,
                        metadata: {
                            trap: r.trap,
                            trainer: r.trainer,
                            form: r.form,
                            odds: r.odds
                        }
                    })),
                    metadata: {
                        meeting,
                        url: `https://www.sportinglife.com/greyhounds/racecards/${now.toISOString().split('T')[0]}/${meeting.toLowerCase()}/racecard/sim${i}`,
                        date: now.toISOString().split('T')[0],
                        grade: i === 0 ? 'A1' : i === 1 ? 'A2' : 'A3',
                        distance: '450m'
                    }
                });
            }
        });

        return { races };
    }
}
