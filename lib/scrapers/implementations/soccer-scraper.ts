import { BaseScraper } from '../core/base-scraper';
import { CompetitionTable, DataEvent } from '../../types/data-schema';

export class SoccerScraper extends BaseScraper<{ tables: CompetitionTable[], events: DataEvent[] }> {
    constructor() {
        super('https://www.espn.co.uk/football/', 'soccer');
    }

    async scrape(): Promise<{ tables: CompetitionTable[], events: DataEvent[] }> {
        await this.init();
        const tables: CompetitionTable[] = [];
        const events: DataEvent[] = [];

        try {
            await this.optimizePage();

            this.page!.on('console', msg => {
                if (msg.type() === 'log') console.log(`[PAGE] ${msg.text()}`);
            });

            // 1. Scrape Premier League Table
            console.log(`[SOCCER SCRAPER] Extracting Premier League Table...`);
            const plTableUrl = 'https://www.espn.co.uk/football/table/_/league/eng.1';
            await this.page!.goto(plTableUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this.page!.waitForSelector('table', { timeout: 10000 }).catch(() => { });

            const plTable = await this.page!.evaluate(() => {
                const entries: any[] = [];
                const rows = Array.from(document.querySelectorAll('table tbody tr')) as HTMLElement[];

                console.log(`Found ${rows.length} rows`);

                for (const row of rows) {
                    const teamLink = row.querySelector('a[href*="/club/"]');
                    if (!teamLink) {
                        // console.log(`Skipping row: No team link. Text: ${row.innerText.substring(0, 50)}`);
                        continue;
                    }

                    // Name
                    let teamName = teamLink.textContent?.trim() || 'Unknown';
                    const fullTeamNameEl = row.querySelector('.team-names .hide-mobile');
                    if (fullTeamNameEl) teamName = fullTeamNameEl.textContent?.trim() || teamName;

                    const href = teamLink.getAttribute('href') || '';
                    const idMatch = href.match(/\/id\/(\d+)\//);
                    const teamId = idMatch ? idMatch[1] : teamName.toLowerCase().replace(/\s+/g, '_');

                    // Stats
                    // Get all text, split, filter for numbers
                    const text = row.innerText.replace(/\s+/g, ' ');
                    const parts = text.split(' ').map((p: string) => p.trim());
                    // Filter: must be a number (positive or negative)
                    // But allow string numbers
                    const numbers = parts.filter((p: string) => /^[\+\-]?\d+$/.test(p));

                    // console.log(`Row: ${teamName} -> Numbers: ${numbers.join(', ')}`);

                    // Logic: Last 6 numbers are Stats.
                    // If we have at least 6 numbers, we use them.
                    if (numbers.length < 6) {
                        // console.log(`Skipping ${teamName}: Only ${numbers.length} numbers found.`);
                        continue;
                    }

                    const len = numbers.length;
                    const points = parseInt(numbers[len - 1]);
                    const gd = parseInt(numbers[len - 2]); // Skip usage if not in schema, but index is correct
                    const lost = parseInt(numbers[len - 3]);
                    const drawn = parseInt(numbers[len - 4]);
                    const won = parseInt(numbers[len - 5]);
                    const played = parseInt(numbers[len - 6]);

                    entries.push({
                        participant_id: `soccer_pl_${teamId}`,
                        participant_name: teamName,
                        played,
                        won,
                        drawn,
                        lost,
                        points,
                        form: []
                    });
                }

                return {
                    id: 'soccer_pl_table',
                    season_id: 'soccer_pl_2025_2026',
                    entries: entries,
                    last_updated: new Date().toISOString()
                };
            });

            if (plTable.entries.length > 0) {
                // Dedupe
                const seen = new Set();
                const uniqueEntries = [];
                for (const e of plTable.entries) {
                    if (!seen.has(e.participant_name)) {
                        seen.add(e.participant_name);
                        uniqueEntries.push(e);
                    }
                }
                plTable.entries = uniqueEntries;
                tables.push(plTable);
            }

            // 2. Fixtures
            console.log(`[SOCCER SCRAPER] Extracting Premier League Fixtures...`);
            const plFixturesUrl = 'https://www.espn.co.uk/football/schedule/_/league/eng.1';
            await this.page!.goto(plFixturesUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this.page!.waitForSelector('.schedule', { timeout: 10000 }).catch(() => { });

            const plMultiEvents = await this.page!.evaluate(() => {
                const extractedEvents: any[] = [];
                const rows = Array.from(document.querySelectorAll('tr')) as HTMLElement[];

                const currentDate = new Date().toISOString();

                for (const row of rows) {
                    const links = Array.from(row.querySelectorAll('a[href*="/club/"]'));
                    // Filter out short text links (like "v")
                    const teamLinks = links.filter(a => (a.textContent?.length || 0) > 2);

                    if (teamLinks.length < 2) continue;

                    const homeName = teamLinks[0].textContent?.trim() || 'Unknown';
                    const awayName = teamLinks[1].textContent?.trim() || 'Unknown';

                    const rowText = row.innerText;
                    const scoreMatch = rowText.match(/(\d+)\s*-\s*(\d+)/);
                    let hScore, aScore;
                    let status = 'scheduled';

                    if (scoreMatch) {
                        hScore = parseInt(scoreMatch[1]);
                        aScore = parseInt(scoreMatch[2]);
                        status = 'finished';
                    } else if (rowText.toLowerCase().includes('live')) {
                        status = 'live';
                    } else if (rowText.toLowerCase().includes('postponed')) {
                        status = 'cancelled';
                    }

                    const gameId = Math.random().toString(36).substring(7);

                    extractedEvents.push({
                        id: `soccer_pl_${gameId}`,
                        sport: 'soccer' as any,
                        name: `${homeName} vs ${awayName}`,
                        start_time: currentDate,
                        status: status as any,
                        participants: [
                            { id: homeName, name: homeName, score: hScore },
                            { id: awayName, name: awayName, score: aScore }
                        ]
                    });
                }
                return extractedEvents;
            });

            events.push(...plMultiEvents);

        } catch (error: any) {
            console.error(`[SOCCER SCRAPER] Global Error: ${error.message}`);
        } finally {
            await this.close();
        }

        return { tables, events };
    }

    getSimulationData(): { tables: CompetitionTable[], events: DataEvent[] } {
        return { tables: [], events: [] };
    }
}
