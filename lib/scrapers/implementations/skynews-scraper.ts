import { getBrowser } from '../browser-manager';
import { Event, StreamLink } from '@/lib/types';

const BASE_URL = 'https://news.sky.com/watch-live';

export async function getSkyNewsEvents(): Promise<Event[]> {
    console.log('[SkyNews] Scraping events...');

    const browser = await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForSelector('body', { timeout: 10000 }).catch(() => { });

        const events = await page.evaluate((baseUrl) => {
            const extracted: any[] = [];
            const programElements = Array.from(document.querySelectorAll(
                '.program, .show, [class*="program"], [class*="show"], h1, h2'
            ));

            let programName = 'Sky Sports News Live';
            let currentShow = '';

            if (programElements.length > 0) {
                const firstElement = programElements[0] as HTMLElement;
                const text = firstElement.innerText.trim();
                if (text && text.length < 100) {
                    programName = text;
                }
            }

            const showElement = document.querySelector('.current-show, [class*="current"]');
            if (showElement) {
                currentShow = (showElement as HTMLElement).innerText.trim();
            }

            const images = Array.from(document.querySelectorAll('img')).map(img => img.src);

            extracted.push({
                id: `sky_news_live_${Date.now()}`,
                name: programName,
                commence_time: 'Live Now',
                sport_key: 'sports_news',
                sport_title: 'Sports News',
                home_team: 'Sky Sports News',
                away_team: currentShow || 'Live Coverage',
                league: {
                    id: 'sky_sports_news',
                    name: 'Sky Sports News',
                    sport: 'sports_news',
                    country: 'UK'
                },
                bookmakers: [],
                streams: [],
                url: baseUrl,
                source: 'Sky Sports News',
                images: images.filter(Boolean).slice(0, 3)
            });

            return extracted;
        }, BASE_URL);

        await page.close();
        return events as Event[];

    } catch (error: any) {
        console.error('[SkyNews] Scrape error:', error.message);
        return [];
    }
}

export async function getSkyNewsStreams(url: string): Promise<StreamLink[]> {
    console.log(`[SkyNews] Seeking streams: ${url}`);

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
                'video, iframe, [class*="player"], [class*="video"], [id*="player"], [id*="video"]'
            ));

            streamElements.forEach((elem, index) => {
                let url = '';
                if (elem.tagName === 'VIDEO') {
                    url = (elem as HTMLVideoElement).src || (elem as HTMLVideoElement).currentSrc;
                } else if (elem.tagName === 'IFRAME') {
                    url = (elem as HTMLIFrameElement).src;
                } else {
                    const anchor = elem.querySelector('a');
                    if (anchor) {
                        url = anchor.getAttribute('href') || '';
                    }
                }

                if (!url) return;

                results.push({
                    streamer: 'Sky Sports News',
                    link_name: `Live Stream ${index + 1}`,
                    url: url.startsWith('http') ? url : `https://news.sky.com${url}`,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 0,
                    language: 'English'
                });
            });

            if (results.length === 0) {
                results.push({
                    streamer: 'Sky Sports News',
                    link_name: 'Live Stream',
                    url: window.location.href,
                    mobile: 'yes',
                    quality: 'HD',
                    ads: 0,
                    language: 'English'
                });
            }

            return results;
        });

        await page.close();
        return streams as StreamLink[];

    } catch (error: any) {
        console.error('[SkyNews] Stream scrape error:', error.message);
        return [];
    }
}
