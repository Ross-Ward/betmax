import { BaseScraper } from '../core/base-scraper';
import { DataEvent, Ranking } from '../../types/data-schema';

export class F1Scraper extends BaseScraper<{ driverStandings: Ranking[], constructorStandings: Ranking[], schedule: DataEvent[] }> {
    constructor() {
        super('https://www.formula1.com/en/results.html/2024/drivers.html', 'f1');
    }

    async scrape(): Promise<{ driverStandings: Ranking[], constructorStandings: Ranking[], schedule: DataEvent[] }> {
        await this.init();
        try {
            await this.optimizePage();
            console.log(`[F1 SCRAPER] Audited access to drivers archive...`);
            await this.page!.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 40000 });
            await this.handleModals();

            const tableSelector = 'table.Table-module_table__cKsW2, table.resultsarchive-table';
            const hasTable = await this.waitFor(tableSelector, 15000);

            if (!hasTable) throw new Error('F1 standings table not found');

            const driverStandings = await this.page!.evaluate((selector) => {
                const rows = Array.from(document.querySelectorAll(`${selector} tbody tr`));
                const entries = rows.slice(0, 15).map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const rankStr = cells[0]?.innerText.trim() || '0';
                    const nameRaw = cells[1]?.innerText.trim() || 'Unknown';
                    const nameClean = nameRaw.replace(/[A-Z]{3}$/, '').trim();
                    const team = cells[3]?.innerText.trim() || '';
                    const pointsStr = cells[4]?.innerText.trim() || '0';

                    return {
                        rank: parseInt(rankStr) || 0,
                        participant_name: nameClean,
                        participant_id: `f1_d_${nameClean.toLowerCase().replace(/\s+/g, '_')}`,
                        points: parseFloat(pointsStr) || 0,
                        metadata: { team }
                    };
                });

                return [{
                    id: 'f1_drivers_2024',
                    sport: 'f1' as const,
                    category: 'Drivers Championship',
                    entries,
                    last_updated: new Date().toISOString()
                } as Ranking];
            }, tableSelector);

            if (driverStandings[0].entries.length === 0) {
                throw new Error('F1 parsing returned 0 drivers');
            }

            await this.close();
            const demo = this.getSimulationData();
            return {
                driverStandings,
                constructorStandings: demo.constructorStandings,
                schedule: demo.schedule
            };

        } catch (error: any) {
            console.error(`[F1 SCRAPER] Live extraction restricted: ${error.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(): { driverStandings: Ranking[], constructorStandings: Ranking[], schedule: DataEvent[] } {
        return {
            driverStandings: [],
            constructorStandings: [],
            schedule: []
        };
    }
}
