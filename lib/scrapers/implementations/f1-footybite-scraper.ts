import puppeteer from 'puppeteer';
import { Event, StreamLink } from '@/lib/types';

import { getStreamEastEvents } from './streameast-scraper';

export async function getF1FootybiteEvents(): Promise<Event[]> {
    console.log('[F1 Footybite] Delegating to StreamEast scraper...');
    try {
        const allEvents = await getStreamEastEvents();
        return allEvents.filter(e => e.sport_key === 'formula_1' || e.sport_title.toLowerCase().includes('formula 1') || e.sport_title.toLowerCase().includes('f1'));
    } catch (error: any) {
        console.error('[F1 Footybite] Scrape error:', error.message);
        return [];
    }
}

export async function getF1FootybiteStreams(url: string): Promise<StreamLink[]> {
    console.log(`Scraping F1 streams from: ${url}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

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
                    streamer: `F1 Stream ${index + 1}`,
                    link_name: text || `Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://f1.footybite.to${url}`,
                    mobile: 'yes',
                    quality: quality,
                    ads: 2,
                    language: language
                });
            });

            return results;
        });

        console.log(`Found ${streams.length} F1 streams`);
        return streams as StreamLink[];

    } catch (error) {
        console.error('F1 Footybite stream scrape error:', error);
        return [];
    } finally {
        await browser.close();
    }
}
