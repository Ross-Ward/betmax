import { DatasetVault } from './dataset-vault';
import { PremierLeagueScraper } from '../scrapers/implementations/pl-scraper';
import { F1Scraper } from '../scrapers/implementations/f1-scraper';
import { UFCScraper } from '../scrapers/implementations/ufc-scraper';
import { PGAScraper } from '../scrapers/implementations/pga-scraper';
import { HorseRacingScraper } from '../scrapers/implementations/horse-scraper';
import { TapologyScraper } from '../scrapers/implementations/tapology-scraper';
import { NBAScraper } from '../scrapers/implementations/nba-scraper';

/**
 * The "Blueprint" for our sports data extraction.
 */
export const INTEL_MAP = {
    soccer: { elements: ['Table', 'Fixtures'], primary_source: 'https://www.premierleague.com/' },
    f1: { elements: ['Standings', 'Schedule'], primary_source: 'https://www.formula1.com/' },
    mma: { elements: ['Rankings', 'Events'], primary_source: 'https://www.ufc.com/' },
    golf: { elements: ['Leaderboard', 'OWGR'], primary_source: 'https://www.pgatour.com/' },
    horse_racing: { elements: ['Meetings', 'Form'], primary_source: 'https://www.attheraces.com/' }
} as const;

export class DataIntelligence {
    static async getSportsData(name: string, season?: string) {
        console.log(`[INTELLIGENCE] Requesting dataset: ${name} (Season: ${season || 'Current'})`);

        // Greyhound races don't use seasons - they're daily data
        let datasetKey = name;
        if (season && season !== '2024/25' && !name.includes('greyhound')) {
            datasetKey = `${name}_${season.replace('/', '_')}`;
        }

        let data = await DatasetVault.load(datasetKey);

        if (!data ||
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === 'object' && Object.keys(data as object).length === 0) ||
            (typeof data === 'object' && (data as any).entries && (data as any).entries.length === 0)) {

            // Check if we are in a build environment to avoid launching browsers during build
            const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production';

            if (isBuild && !process.env.FORCE_SCRAPE_BUILD) {
                console.warn(`[INTELLIGENCE] Data missing or empty for ${datasetKey} during build. Skipping on-demand scrape to optimize build.`);
                return data || (Array.isArray(data) ? [] : {});
            }

            console.warn(`[INTELLIGENCE] Data missing or empty for ${datasetKey}. Executing on-demand intelligence...`);
            await this.triggerOnDemandScrape(name, season);
            data = await DatasetVault.load(datasetKey);
        }
        return data;
    }

    private static async triggerOnDemandScrape(datasetName: string, season: string = '2025/26') {
        const name = datasetName.toLowerCase();
        let scraper: any = null;
        const targetKey = season === '2025/26' ? datasetName : `${datasetName}_${season.replace('/', '_')}`;

        // Import utilities
        const { withTimeout, scraperCircuitBreaker } = await import('../scrapers/scraper-utils');

        // Check circuit breaker
        if (scraperCircuitBreaker.isOpen(name)) {
            console.warn(`[INTELLIGENCE] Circuit breaker open for ${name}, using simulation`);
            throw new Error('Circuit breaker open');
        }

        try {
            // Wrap scraper execution with 15s timeout
            const executeWithTimeout = async (scraperFn: () => Promise<any>) => {
                return await withTimeout(
                    scraperFn(),
                    15000,
                    `Scraper timeout for ${datasetName}`
                );
            };

            if (name.includes('pl_') || name.includes('premier')) {
                // If it's a historical season, we use simulation immediately for "Season by Season" browsing
                if (season !== '2025/26') {
                    scraper = new PremierLeagueScraper();
                    const hist = scraper.getSimulationData(season);
                    await DatasetVault.save(targetKey, hist.table);
                    scraperCircuitBreaker.recordSuccess(name);
                    return;
                }

                scraper = new PremierLeagueScraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save('pl_table', result.table);
                await DatasetVault.save('pl_fixtures', result.fixtures);
                scraperCircuitBreaker.recordSuccess(name);
            }
            else if (name.includes('f1_') || name.includes('formula')) {
                scraper = new F1Scraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save('f1_driver_standings', result.driverStandings);
                await DatasetVault.save('f1_constructor_standings', result.constructorStandings);
                scraperCircuitBreaker.recordSuccess(name);
            }
            else if (name.includes('ufc_') || name.includes('mma') || name.includes('tapology')) {
                // Run UFC and Tapology in parallel
                const [ufcResult, tapResult] = await Promise.allSettled([
                    executeWithTimeout(async () => {
                        const ufc = new UFCScraper();
                        return await ufc.scrape();
                    }),
                    executeWithTimeout(async () => {
                        const tap = new TapologyScraper();
                        return await tap.scrape();
                    })
                ]);

                if (ufcResult.status === 'fulfilled') {
                    await DatasetVault.save('ufc_rankings', ufcResult.value.rankings);
                    await DatasetVault.save('ufc_events', ufcResult.value.events);
                }

                if (tapResult.status === 'fulfilled') {
                    await DatasetVault.save('mma_p4p_rankings', tapResult.value.rankings);
                }

                // Success if at least one succeeded
                if (ufcResult.status === 'fulfilled' || tapResult.status === 'fulfilled') {
                    scraperCircuitBreaker.recordSuccess(name);
                } else {
                    throw new Error('Both UFC scrapers failed');
                }
            }
            else if (name.includes('pga_') || name.includes('golf')) {
                scraper = new PGAScraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save('pga_leaderboard', result.leaderboard);
                await DatasetVault.save('pga_rankings', result.rankings);
                scraperCircuitBreaker.recordSuccess(name);
            }
            else if (name.includes('nba') || name.includes('basketball')) {
                scraper = new NBAScraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save(targetKey, result.table);
                scraperCircuitBreaker.recordSuccess(name);
            }
            else if (name.includes('horse_') || name.includes('racing')) {
                scraper = new HorseRacingScraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save('horse_racing_meetings', result.meetings);
                scraperCircuitBreaker.recordSuccess(name);
            }
            else if (name.includes('greyhound')) {
                const { GreyhoundScraper } = await import('../scrapers/implementations/greyhounds-scraper');
                scraper = new GreyhoundScraper();
                const result = await executeWithTimeout(() => scraper.scrape());
                await DatasetVault.save('greyhound_races', result.races);
                scraperCircuitBreaker.recordSuccess(name);
            }
        } catch (error: any) {
            console.error(`[INTELLIGENCE] Scraper failed for ${datasetName}: ${error.message}. Switching to Simulation Mode.`);
            scraperCircuitBreaker.recordFailure(name);

            if (scraper) {
                const fallback = scraper.getSimulationData(season);
                await this.saveResult(name, fallback);
            } else {
                await DatasetVault.save(targetKey, { error: "Scraper unavailable", simulated: true });
            }
        }
    }

    private static async saveResult(originalName: string, data: any) {
        // If we requested a specific dataset name, ensure THAT name is saved
        // along with the compound datasets.

        if (originalName.includes('pl_') || originalName.includes('soccer')) {
            if (data.table) await DatasetVault.save('pl_table', data.table);
            if (data.fixtures) await DatasetVault.save('pl_fixtures', data.fixtures);
        }
        else if (originalName.includes('f1_') || originalName.includes('formula')) {
            if (data.driverStandings) await DatasetVault.save('f1_driver_standings', data.driverStandings);
            if (data.constructorStandings) await DatasetVault.save('f1_constructor_standings', data.constructorStandings);
            if (data.schedule) await DatasetVault.save('f1_schedule', data.schedule);
        }
        else if (originalName.includes('ufc_') || originalName.includes('mma') || originalName.includes('tapology')) {
            if (data.rankings) await DatasetVault.save('ufc_rankings', data.rankings);
            if (data.events) await DatasetVault.save('ufc_events', data.events);
            // Handle specific tapology request
            if (originalName.includes('tapology') || originalName.includes('p4p')) {
                await DatasetVault.save(originalName, data.rankings || []);
            }
        }
        else if (originalName.includes('pga_') || originalName.includes('golf')) {
            if (data.leaderboard) await DatasetVault.save('pga_leaderboard', data.leaderboard);
            if (data.rankings) await DatasetVault.save('pga_rankings', data.rankings);
        }
        else if (originalName.includes('horse_') || originalName.includes('racing')) {
            if (data.meetings) await DatasetVault.save('horse_racing_meetings', data.meetings);
        }
        else if (originalName.includes('nba') || originalName.includes('basketball')) {
            if (data.table) await DatasetVault.save(originalName, data.table);
        }
        else if (originalName.includes('greyhound')) {
            if (data.races) await DatasetVault.save('greyhound_races', data.races);
        }

        // Always ensure the specific requested name is saved so the retry loop stops
        if (originalName.endsWith('_historical') || originalName.endsWith('_form')) {
            // Keep existing Kaggle data if it was historical
        } else {
            // Save whatever we got as the primary name if it's not already saved
            const current = await DatasetVault.load(originalName);
            if (!current) {
                await DatasetVault.save(originalName, data);
            }
        }
    }
}
