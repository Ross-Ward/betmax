import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';

import { getStreamEastEvents } from './streameast-scraper';

export async function getNFLEvents(): Promise<Event[]> {
    console.log('[NFLBite] Delegating to StreamEast scraper...');
    try {
        const allEvents = await getStreamEastEvents();
        return allEvents.filter(e => e.sport_key === 'american_football' || e.sport_title.toLowerCase().includes('nfl') || e.sport_title.toLowerCase().includes('american football'));
    } catch (error: any) {
        console.error('[NFLBite] Scrape error:', error.message);
        return [];
    }
}

export async function getNFLStreams(url: string): Promise<StreamLink[]> {
    console.log(`[NFLBite] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const streams = await page.evaluate(() => {
            const results: any[] = [];
            const streamElements = Array.from(document.querySelectorAll(
                'a[href*="stream"], .stream-link, .link-button, [class*="stream"]'
            ));

            streamElements.forEach((elem, index) => {
                const anchor = elem.tagName === 'A' ? elem : elem.querySelector('a');
                if (!anchor) return;

                const url = anchor.getAttribute('href');
                if (!url) return;

                const text = (elem as HTMLElement).innerText.trim();
                const quality = text.match(/HD|SD|4K|1080p|720p/i)?.[0] || 'SD';
                const language = text.match(/English|Spanish|French|German/i)?.[0] || 'English';

                results.push({
                    streamer: `NFLBite Stream ${index + 1}`,
                    link_name: text || `Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://www.nflbite.is${url}`,
                    mobile: 'yes',
                    quality: quality,
                    ads: 2,
                    language: language
                });
            });

            return results;
        });

        await page.close();
        return streams as StreamLink[];

    } catch (error: any) {
        console.error('[NFLBite] Stream scrape error:', error.message);
        return [];
    }
}
