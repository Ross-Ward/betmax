import { BaseScraper } from '../core/base-scraper';
import { DataEvent, CompetitionTable } from '../../types/data-schema';

export class PremierLeagueScraper extends BaseScraper<{ table: CompetitionTable, fixtures: DataEvent[] }> {
    constructor() {
        super('https://www.oddsportal.com/football/england/premier-league/standings/', 'soccer');
    }

    async scrape(): Promise<{ table: CompetitionTable, fixtures: DataEvent[] }> {
        await this.init();
        try {
            await this.optimizePage();
            console.log(`[PL SCRAPER] Accessing mid-season intel via OddsPortal...`);
            await this.page!.goto(this.sourceUrl, { waitUntil: 'domcontentloaded', timeout: 50000 });

            // Wait for the standings table structure
            await this.page!.waitForSelector('#table-type-1', { timeout: 20000 }).catch(() => { });

            const table = await this.page!.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('#table-type-1 tbody tr'));
                const entries = rows.map((row) => {
                    const name = row.querySelector('.participant_name .team_name_span')?.textContent?.trim() ||
                        row.querySelector('.participant_name')?.textContent?.trim() || 'Unknown';

                    const getStat = (cls: string) => row.querySelector(cls)?.textContent?.trim() || '0';
                    const goalsText = getStat('.goals'); // Format "GF:GA"
                    const [gf, ga] = goalsText.split(':').map(n => parseInt(n) || 0);

                    const formNodes = Array.from(row.querySelectorAll('.form a'));
                    const formList = formNodes.map(a => {
                        if (a.classList.contains('form-w')) return 'W';
                        if (a.classList.contains('form-l')) return 'L';
                        if (a.classList.contains('form-d')) return 'D';
                        return '';
                    }).filter(Boolean);

                    return {
                        participant_id: `pl_t_${name.toLowerCase().replace(/\s+/g, '_')}`,
                        participant_name: name,
                        played: parseInt(getStat('.matches_played')) || 0,
                        won: parseInt(getStat('.wins_regular')) || 0,
                        drawn: parseInt(getStat('.draws')) || 0,
                        lost: parseInt(getStat('.losses_regular')) || 0,
                        goals_for: gf,
                        goals_against: ga,
                        points: parseInt(getStat('.points')) || 0,
                        form: formList.length > 0 ? formList : ['W', 'D', 'W', 'W', 'L']
                    };
                }).filter(e => e.participant_name !== 'Unknown');

                return {
                    id: 'pl_table_2025_2026',
                    season_id: 'pl_2025_2026',
                    entries: entries,
                    last_updated: new Date().toISOString()
                };
            });

            if (table.entries.length === 0) throw new Error('Zero entries extracted');

            await this.close();
            return { table, fixtures: [] };

        } catch (error: any) {
            console.error(`[PL SCRAPER] Status Check failed: ${error.message}. Simulation fallback.`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(season: string = '2025/26'): { table: CompetitionTable, fixtures: DataEvent[] } {
        if (season === '2024/25') {
            return {
                table: {
                    id: 'pl_table_2425',
                    season_id: 'pl_2024_2025',
                    entries: [
                        { participant_id: 'pl_t_man_city', participant_name: 'Man City', played: 38, won: 29, drawn: 4, lost: 5, goals_for: 94, goals_against: 33, points: 91, form: ['W', 'W', 'W', 'W', 'W'] },
                        { participant_id: 'pl_t_arsenal', participant_name: 'Arsenal', played: 38, won: 28, drawn: 5, lost: 5, goals_for: 91, goals_against: 29, points: 89, form: ['W', 'W', 'W', 'W', 'W'] },
                        { participant_id: 'pl_t_liverpool', participant_name: 'Liverpool', played: 38, won: 24, drawn: 10, lost: 4, goals_for: 86, goals_against: 41, points: 82, form: ['W', 'D', 'W', 'D', 'W'] }
                    ],
                    last_updated: new Date().toISOString()
                },
                fixtures: []
            };
        }

        return {
            table: {
                id: 'pl_table_2526_empty',
                season_id: 'pl_2025_2026',
                entries: [],
                last_updated: new Date().toISOString()
            },
            fixtures: []
        };
    }
}
