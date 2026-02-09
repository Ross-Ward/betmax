import { BaseScraper } from '../core/base-scraper';
import { DataEvent, Ranking } from '../../types/data-schema';

export class UFCScraper extends BaseScraper<{ rankings: Ranking[], events: DataEvent[] }> {
    constructor() {
        super('https://www.ufc.com/rankings', 'mma');
    }

    async scrape(): Promise<{ rankings: Ranking[], events: DataEvent[] }> {
        await this.init();
        try {
            await this.optimizePage();
            console.log(`[UFC SCRAPER] Accessing rankings vault...`);
            await this.page!.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 35000 });
            await this.handleModals();

            const hasRankings = await this.waitFor('.view-grouping', 15000);
            if (!hasRankings) throw new Error('UFC rankings grouping not found');

            const rankings = await this.page!.evaluate(() => {
                const results: any[] = [];
                const groups = Array.from(document.querySelectorAll('.view-grouping'));

                groups.slice(0, 5).forEach(group => {
                    const category = group.querySelector('.view-grouping-header')?.textContent?.trim() || 'Division';
                    const rows = Array.from(group.querySelectorAll('tr')).slice(0, 15);

                    const entries = rows.map(row => {
                        const rank = row.querySelector('.views-field-weight-class-rank')?.textContent?.trim() || '0';
                        const name = row.querySelector('.views-field-title a')?.textContent?.trim() || 'Unknown';

                        return {
                            rank: parseInt(rank) || 0,
                            participant_name: name,
                            participant_id: `ufc_p_${name.toLowerCase().replace(/\s+/g, '_')}`
                        };
                    }).filter(e => e.participant_name !== 'Unknown');

                    if (entries.length > 0) {
                        results.push({
                            id: `ufc_rank_${category.toLowerCase().replace(/\s+/g, '_')}`,
                            sport: 'mma' as const,
                            category,
                            entries,
                            last_updated: new Date().toISOString()
                        });
                    }
                });
                return results;
            });

            if (rankings.length === 0) {
                throw new Error('UFC parsing returned 0 rankings');
            }

            await this.close();
            return { rankings, events: this.getSimulationData().events };

        } catch (error: any) {
            console.error(`[UFC SCRAPER] Live extraction failed: ${error.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(): { rankings: Ranking[], events: DataEvent[] } {
        return {
            rankings: [],
            events: []
        };
    }
}
