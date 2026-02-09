import { UFCScraper } from '../scrapers/implementations/ufc-scraper';
import { F1Scraper } from '../scrapers/implementations/f1-scraper';
import { PremierLeagueScraper } from '../scrapers/implementations/pl-scraper';
import { HorseRacingScraper } from '../scrapers/implementations/horse-scraper';
import { DatasetVault } from './dataset-vault';

export class DatasetOrchestrator {
    /**
     * Run all scrapers and update the local vault.
     */
    static async updateAll() {
        console.log(`[ORCHESTRATOR] Starting full dataset update...`);

        try {
            // 1. UFC
            const ufc = new UFCScraper();
            const ufcData = await ufc.scrape();
            await DatasetVault.save('ufc_rankings', ufcData.rankings);
            await DatasetVault.save('ufc_events', ufcData.events);

            // 2. F1
            const f1 = new F1Scraper();
            const f1Data = await f1.scrape();
            await DatasetVault.save('f1_driver_standings', f1Data.driverStandings);
            await DatasetVault.save('f1_constructor_standings', f1Data.constructorStandings);

            // 3. Premier League
            const pl = new PremierLeagueScraper();
            const plData = await pl.scrape();
            await DatasetVault.save('pl_table', plData.table);
            await DatasetVault.save('pl_fixtures', plData.fixtures);

            // 4. Horse Racing
            const horse = new HorseRacingScraper();
            const horseData = await horse.scrape();
            await DatasetVault.save('horse_racing_meetings', horseData.meetings);

            console.log(`[ORCHESTRATOR] Successfully updated all datasets.`);
        } catch (error) {
            console.error(`[ORCHESTRATOR] Fatal update error:`, error);
        }
    }
}
