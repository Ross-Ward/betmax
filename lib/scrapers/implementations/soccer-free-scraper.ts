import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';

import { getStreamEastEvents } from './streameast-scraper';

export async function getSoccerFreeEvents(): Promise<Event[]> {
    console.log('[SoccerFree] Delegating to StreamEast scraper...');
    try {
        const allEvents = await getStreamEastEvents();
        return allEvents.filter(e => e.sport_key === 'soccer' || e.sport_title.toLowerCase().includes('soccer') || e.sport_title.toLowerCase().includes('football'));
    } catch (error: any) {
        console.error('[SoccerFree] Scrape error:', error.message);
        return [];
    }
}

export async function getSoccerFreeStreams(url: string): Promise<StreamLink[]> {
    console.log(`[SoccerFree] Seeking streams: ${url}`);

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();

        // Import anti-detection utilities
        const { getRandomUserAgent, getRandomHeaders } = await import('../scraper-utils');
        await page.setUserAgent(getRandomUserAgent());
        await page.setExtraHTTPHeaders(getRandomHeaders());

        await page.goto(url, {
            waitUntil: 'domcontentloaded',  // Changed from networkidle2
            timeout: 12000  // Reduced from 30s to 12s
        });

        const streams = await page.evaluate((pageUrl) => {
            const results: any[] = [];

            const iframes = Array.from(document.querySelectorAll('iframe[src]'));
            iframes.forEach((iframe, index) => {
                const src = iframe.getAttribute('src');
                if (src && (src.includes('embed') || src.includes('player') || src.includes('stream'))) {
                    results.push({
                        streamer: `Soccer-Free Embed ${index + 1}`,
                        link_name: `Embedded Player ${index + 1}`,
                        url: src.startsWith('http') ? src : `https:${src}`,
                        mobile: 'yes',
                        quality: 'HD',
                        ads: 2,
                        language: 'English'
                    });
                }
            });

            const streamElements = Array.from(document.querySelectorAll(
                'a[href*="stream"], .stream-link, .link-button, [class*="stream"], .data-row, a[href*="player"]'
            ));

            streamElements.forEach((elem, index) => {
                const anchor = elem.tagName === 'A' ? elem : elem.querySelector('a');
                if (!anchor) return;

                const streamUrl = anchor.getAttribute('href');
                if (!streamUrl) return;

                const text = (elem as HTMLElement).innerText.trim();
                const quality = text.match(/HD|SD|4K|1080p|720p/i)?.[0] || 'HD';
                const language = text.match(/English|Spanish|French|German|Arabic|Portuguese/i)?.[0] || 'English';

                results.push({
                    streamer: `Soccer Stream ${index + 1}`,
                    link_name: text || `Stream ${index + 1}`,
                    url: streamUrl.startsWith('http') ? streamUrl : `https://www.soccer-free.com${streamUrl}`,
                    mobile: 'yes',
                    quality: quality,
                    ads: 2,
                    language: language
                });
            });

            if (results.length === 0) {
                results.push({
                    streamer: 'Soccer-Free',
                    link_name: 'Watch on Soccer-Free (Manual)',
                    url: pageUrl,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 3,
                    language: 'Various',
                    note: 'May require captcha verification - open in new tab'
                });
            }

            return results;
        }, url);

        await page.close();
        return streams as StreamLink[];

    } catch (error: any) {
        console.error('[SoccerFree] Stream scrape error:', error.message);
        return [{
            streamer: 'Soccer-Free',
            link_name: 'Watch Live',
            url: url,
            mobile: 'yes',
            quality: 'HD',
            ads: 3,
            language: 'Various'
        }];
    }
}
