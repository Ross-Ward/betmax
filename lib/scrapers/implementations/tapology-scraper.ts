import { BaseScraper } from '../core/base-scraper';
import { DataEvent, Participant, Ranking, SportType } from '../../types/data-schema';
import { ScrapeQueue, QueueItem } from '../core/scrape-queue';
import * as path from 'path';

interface TapologyData {
    rankings: Ranking[];
    events: DataEvent[];
    fighters: Participant[];
}

export class TapologyScraper extends BaseScraper<TapologyData> {
    private queue: ScrapeQueue;
    private maxItemsPerRun = 50;
    private visitedUrls: Set<string> = new Set();

    constructor() {
        super('https://www.tapology.com/fightcenter', 'mma');
        // Persistence directory
        const storageDir = 'f:/Software Developement/Web Developement/openbet/betmax/lib/data/tapology';
        this.queue = new ScrapeQueue(storageDir);
    }

    async init(): Promise<void> {
        console.log('[TAPOLOGY] Initializing Production Scraper...');
        try {
            await super.init();
            await this.optimizePage();
            console.log('[TAPOLOGY] Init successful.');
        } catch (e) {
            console.error('[TAPOLOGY] Init failed:', e);
            throw e;
        }
    }

    async scrape(): Promise<TapologyData> {
        console.log('[TAPOLOGY] Scraping session started.');
        const data: TapologyData = { rankings: [], events: [], fighters: [] };

        try {
            await this.init();

            // 1. Seed the queue if empty
            if (this.queue.getPendingCount() === 0) {
                console.log('[TAPOLOGY] Queue empty. Seeding with primary categories...');
                this.seedQueue();
            }

            // 2. Main Orchestration Loop
            let processedInThisRun = 0;
            while (processedInThisRun < this.maxItemsPerRun) {
                const item = this.queue.getNext();
                if (!item) {
                    console.log('[TAPOLOGY] No more items in queue.');
                    break;
                }

                console.log(`[TAPOLOGY] [${processedInThisRun + 1}/${this.maxItemsPerRun}] Processing ${item.type}: ${item.url}`);
                this.queue.updateStatus(item.url, 'processing');

                try {
                    switch (item.type) {
                        case 'ranking':
                            const ranking = await this.scrapeRankingPage(item);
                            if (ranking) data.rankings.push(ranking);
                            break;
                        case 'event':
                            const event = await this.scrapeEventPage(item);
                            if (event) data.events.push(event);
                            break;
                        case 'fighter':
                            const fighter = await this.scrapeFighterPage(item);
                            if (fighter) data.fighters.push(fighter);
                            break;
                    }
                    this.queue.updateStatus(item.url, 'completed');
                } catch (e: any) {
                    console.error(`[TAPOLOGY] Failed to process ${item.url}:`, e.message);
                    this.queue.updateStatus(item.url, 'failed', e.message);
                }

                processedInThisRun++;
                // Progress Reporting
                const stats = this.queue.getStats();
                console.log(`[PROGRESS] Queue: ${stats.completed} done, ${stats.pending} pending, ${stats.failed} failed.`);

                // Rate Limit Jitter: 3-7 seconds for production safety
                await new Promise(r => setTimeout(r, 3000 + Math.random() * 4000));
            }

            await this.close();
            return data;
        } catch (e: any) {
            console.error(`[TAPOLOGY] Orchestration Failure: ${e.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    private seedQueue() {
        // Core seeds across all martial arts
        const seeds: { url: string; type: QueueItem['type']; sport: SportType }[] = [
            { url: 'https://www.tapology.com/rankings/current-top-10-best-pound-for-pound-mma-and-ufc-fighters', type: 'ranking', sport: 'mma' },
            { url: 'https://www.tapology.com/rankings/225-top-boxing-pound-for-pound-rankings', type: 'ranking', sport: 'boxing' },
            { url: 'https://www.tapology.com/fightcenter?group=major&sport=mma', type: 'ranking', sport: 'mma' }, // Using FightCenter as a ranking discovery
            { url: 'https://www.tapology.com/rankings/top-kickboxing-fighters-of-all-time', type: 'ranking', sport: 'kickboxing' }
        ];

        seeds.forEach(s => this.queue.add(s.url, s.type, s.sport));
    }

    private async scrapeRankingPage(item: QueueItem): Promise<Ranking | null> {
        await this.page!.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await this.handleModals();

        // Use the existing logic but enhanced
        const ranking = await this.scrapeRankingTable(item.sport, 'Pound for Pound');
        if (ranking) {
            // Add all discovered fighter URLs to the queue
            ranking.entries.forEach(entry => {
                this.queue.add(entry.participant_id, 'fighter', item.sport);
            });
        }
        return ranking;
    }

    private async scrapeRankingTable(sport: string, categoryName: string): Promise<Ranking | null> {
        try {
            await this.page!.waitForSelector('.rankingItemsItem', { timeout: 10000 });
        } catch (e) {
            return null;
        }

        const entries = await this.page!.$$eval('.rankingItemsItem', (rows) => {
            return rows.map((row) => {
                const rankText = row.querySelector('.rankingItemsItemRank')?.textContent?.trim() || '0';
                const nameLink = row.querySelector('.name a') as HTMLAnchorElement;
                return {
                    rank: parseInt(rankText.replace('.', '')),
                    participant_name: nameLink?.textContent?.trim() || 'Unknown',
                    participant_id: nameLink?.href || '', // URL
                    change: 0
                };
            });
        });

        return {
            id: `tapology_${sport}_${categoryName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
            sport: sport as SportType,
            category: categoryName,
            entries,
            last_updated: new Date().toISOString()
        };
    }

    private async scrapeEventPage(item: QueueItem): Promise<DataEvent | null> {
        await this.page!.goto(item.url, { waitUntil: 'domcontentloaded' });

        // Extraction logic (from existing scrapeEvents)
        const eventDetails: any = await this.page!.evaluate(function () {
            const getListText = (label: string) => {
                const items = Array.from(document.querySelectorAll('li'));
                for (const li of items) {
                    if (li.textContent?.includes(label)) {
                        return li.querySelector('span:not(.font-bold)')?.textContent?.trim();
                    }
                }
                return null;
            };

            const title = document.querySelector('h2.text-2xl')?.textContent?.trim() ||
                document.querySelector('#eventPageHeader .text-tap_3')?.textContent?.trim() ||
                'Unknown Event';
            const date = getListText('Date/Time');
            const venue = getListText('Venue');

            const bouts: any[] = [];
            document.querySelectorAll('div[data-bout-wrapper]').forEach((boutRow) => {
                const fA = boutRow.querySelector('div[id*="_leftBio"] a') as HTMLAnchorElement;
                const fB = boutRow.querySelector('div[id*="_rightBio"] a') as HTMLAnchorElement;
                const sportAttr = boutRow.getAttribute('data-sport') || 'mma';
                const weightClass = boutRow.querySelector('.uppercase.font-bold')?.textContent?.trim();

                if (fA && fB) {
                    bouts.push({
                        fighterA: { name: fA.textContent?.trim(), url: fA.href },
                        fighterB: { name: fB.textContent?.trim(), url: fB.href },
                        sport: sportAttr,
                        weight: weightClass
                    });
                }
            });

            return { title, date, venue, bouts };
        });

        if (eventDetails) {
            // Add fighters and potentially new sports to the queue
            eventDetails.bouts.forEach((b: any) => {
                this.queue.add(b.fighterA.url, 'fighter', b.sport || item.sport);
                this.queue.add(b.fighterB.url, 'fighter', b.sport || item.sport);
            });

            return {
                id: item.url.split('/').pop() || 'unknown',
                name: eventDetails.title,
                sport: item.sport as SportType,
                start_time: eventDetails.date || new Date().toISOString(),
                venue: eventDetails.venue,
                status: 'scheduled',
                participants: eventDetails.bouts.flatMap((b: any) => [
                    { id: b.fighterA.name, name: b.fighterA.name, metadata: { url: b.fighterA.url, weight: b.weight } },
                    { id: b.fighterB.name, name: b.fighterB.name, metadata: { url: b.fighterB.url, weight: b.weight } }
                ])
            };
        }
        return null;
    }

    private async scrapeFighterPage(item: QueueItem): Promise<Participant | null> {
        try {
            await this.page!.goto(item.url, { waitUntil: 'domcontentloaded' });

            const data = await this.page!.evaluate(function () {
                const getStat = (label: string, containerSelector = '#standardDetails') => {
                    const container = document.querySelector(containerSelector);
                    if (container) {
                        const rows = Array.from(container.querySelectorAll('li, div'));
                        for (const row of rows) {
                            const strong = row.querySelector('strong');
                            if (strong && strong.textContent?.includes(label)) {
                                let val = row.querySelector('span')?.textContent?.trim();
                                if (val && val !== 'N/A') return val;
                            }
                        }
                    }
                    return null;
                };

                const name = document.querySelector('#fighterPageHeader .text-tap_3')?.textContent?.trim() ||
                    document.querySelector('#fighterPageHeader div.div.text-tap_3.text-\\[26px\\]')?.textContent?.trim() ||
                    'Unknown';
                const record = document.querySelector('a[href="#fighterRecordHeader"] .text-\\[26px\\]')?.textContent?.trim();

                const history: any[] = [];
                document.querySelectorAll("div[data-fighter-bout-target='bout']").forEach(row => {
                    const sportValue = row.getAttribute('data-sport') || 'mma';
                    const statusValue = row.getAttribute('data-status');
                    const weightVal = row.querySelector('.displayWeight .font-bold')?.textContent?.trim();

                    history.push({
                        result: row.querySelector('.result .font-extrabold')?.textContent?.trim(),
                        result_detail: row.querySelector('.div.text-\\[#29b829\\]')?.textContent?.trim() ||
                            row.querySelector('.div.text-neutral-500')?.textContent?.trim(),
                        opponent: row.querySelector(".truncate a")?.textContent?.trim(),
                        opponent_url: (row.querySelector(".truncate a") as HTMLAnchorElement)?.href,
                        event: row.querySelector(".text-xs10 a")?.textContent?.trim() ||
                            row.querySelector(".text-xs11 a")?.textContent?.trim(),
                        method: row.querySelector(".text-xs.font-bold")?.textContent?.trim() ||
                            row.querySelector(".text-neutral-700.text-xs")?.textContent?.trim(),
                        date: row.querySelector(".basis-\\[14\\%\\] .text-xs11")?.textContent?.trim() ||
                            row.querySelector(".basis-\\[8\\%\\] .text-xs11")?.textContent?.trim(),
                        sport: sportValue,
                        status: statusValue,
                        weight: weightVal
                    });
                });

                return {
                    name, record, history,
                    height: getStat('Height'),
                    reach: getStat('Reach'),
                    dob: getStat('Born')
                };
            });

            if (data) {
                return {
                    id: item.url.split('/').pop() || 'unknown',
                    name: data.name,
                    type: 'individual',
                    sport: item.sport as SportType,
                    stats: {
                        height: data.height,
                        reach: data.reach,
                        dob: data.dob,
                        record: data.record,
                        fight_history: data.history
                    },
                    metadata: { url: item.url }
                };
            }
        } catch (e) {
            console.warn(`[TAPOLOGY] Failed to scrape fighter ${item.url}`);
        }
        return null;
    }

    getSimulationData(): TapologyData {
        return { rankings: [], events: [], fighters: [] };
    }
}

