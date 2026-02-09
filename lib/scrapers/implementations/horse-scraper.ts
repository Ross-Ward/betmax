import { BaseScraper } from '../core/base-scraper';
import { DataEvent } from '../../types/data-schema';

export class HorseRacingScraper extends BaseScraper<{ meetings: DataEvent[] }> {
    constructor() {
        super('https://www.attheraces.com/racecards', 'horse-racing');
    }

    async scrape(): Promise<{ meetings: DataEvent[] }> {
        await this.init();
        try {
            await this.optimizePage();
            console.log(`[HORSE SCRAPER] Scanning track conditions...`);
            await this.page!.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 35000 });
            await this.handleModals();

            const hasMeetings = await this.waitFor('.panel-header', 15000);
            if (!hasMeetings) throw new Error('Horse racing meetings not found');

            const meetings = await this.page!.evaluate(() => {
                const results: any[] = [];
                const panels = Array.from(document.querySelectorAll('.panel-header'));

                panels.forEach((panel, i) => {
                    const course = panel.querySelector('h2')?.textContent?.replace(' Racecards', '').trim() || 'Unknown Track';
                    const content = panel.parentElement;
                    if (content) {
                        const raceLinks = Array.from(content.querySelectorAll('a.a--plain[href*="/racecard/"]'));
                        raceLinks.forEach((link, j) => {
                            const text = link.textContent?.trim() || '';
                            const [time, ...nameParts] = text.split(' - ');
                            const title = nameParts.join(' - ');

                            if (time && time.includes(':')) {
                                results.push({
                                    id: `horse_${course.toLowerCase().replace(/\s+/g, '_')}_${time.replace(':', '')}`,
                                    sport: 'horse-racing' as const,
                                    name: `${course} - ${time}: ${title || 'Flat'}`,
                                    start_time: time,
                                    venue: course,
                                    status: 'scheduled' as const,
                                    participants: [],
                                    metadata: { meeting_id: i }
                                });
                            }
                        });
                    }
                });
                return results;
            });

            await this.close();
            return { meetings: meetings.length > 0 ? meetings : this.getSimulationData().meetings };

        } catch (error: any) {
            console.error(`[HORSE SCRAPER] Track access denied: ${error.message}`);
            await this.close();
            return this.getSimulationData();
        }
    }

    getSimulationData(): { meetings: DataEvent[] } {
        return {
            meetings: []
        };
    }
}
