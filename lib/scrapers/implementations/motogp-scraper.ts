import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';

import { getStreamEastEvents } from './streameast-scraper';

export async function getMotoGPEvents(): Promise<Event[]> {
    console.log('[MotoGP] Delegating to StreamEast scraper...');
    try {
        const allEvents = await getStreamEastEvents();
        // Since StreamEast might not have explicit 'motogp' key, we return anything that looks like racing but not F1 (or include F1 if desired, but better to keep separate if possible)
        // Actually, StreamEast puts motorsports under 'f1' or 'boxing/ufc' sometimes weirdly. 
        // Let's filter for anything with 'moto' or 'racing' or 'grand prix' in title, excluding F1 if it's strictly MotoGP scraper.
        return allEvents.filter(e =>
            (e.sport_key === 'motorsport' || (e.name || '').toLowerCase().includes('moto') || (e.name || '').toLowerCase().includes('grand prix') || (e.name || '').toLowerCase().includes('racing'))
            && !e.sport_key.includes('formula_1')
            && !(e.name || '').toLowerCase().includes('f1')
        );
    } catch (error: any) {
        console.error('[MotoGP] Scrape error:', error.message);
        return [];
    }
}

export async function getMotoGPStreams(url: string): Promise<StreamLink[]> {
    console.log(`[MotoGP] Seeking streams: ${url}`);

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
                'a[href*="stream"], .stream-link, .link-button, [class*="stream"], .data-row'
            ));

            streamElements.forEach((elem, index) => {
                const anchor = elem.tagName === 'A' ? elem : elem.querySelector('a');
                if (!anchor) return;

                const url = anchor.getAttribute('href');
                if (!url) return;

                const text = (elem as HTMLElement).innerText.trim();
                const quality = text.match(/HD|SD|4K|1080p|720p/i)?.[0] || 'HD';
                const language = text.match(/English|Spanish|French|German|International/i)?.[0] || 'English';

                results.push({
                    streamer: `MotoGP Stream ${index + 1}`,
                    link_name: text || `Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://motogp.footybite.to${url}`,
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
        console.error('[MotoGP] Stream scrape error:', error.message);
        return [];
    }
}
