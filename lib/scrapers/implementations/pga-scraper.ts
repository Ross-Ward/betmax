import { BaseScraper } from '../core/base-scraper';
import { DataEvent, Ranking } from '../../types/data-schema';

export class PGAScraper extends BaseScraper<{ leaderboard: DataEvent[], rankings: Ranking[] }> {
    constructor() {
        super('https://www.pgatour.com/leaderboard', 'golf');
    }

    async scrape(): Promise<{ leaderboard: DataEvent[], rankings: Ranking[] }> {
        await this.init();
        try {
            await this.optimizePage();
            console.log(`[PGA SCRAPER] Navigating to the clubhouse...`);
            await this.page!.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 35000 });
            await this.handleModals();

            const hasLeaderboard = await this.waitFor('[class*="Leaderboard"]', 10000);

            await this.close();
            return this.getSimulationData();
        } catch (e: any) {
            console.warn(`[PGA SCRAPER] Course restricted: ${e.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(): { leaderboard: DataEvent[], rankings: Ranking[] } {
        return {
            leaderboard: [],
            rankings: []
        };
    }
}
