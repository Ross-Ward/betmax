import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[Resolver] Deep seeking stream for: ${url}`);

        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        const page = await browser.newPage();

        // Randomize User Agent further or use a very common one
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Anti-Detection measures
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        try {
            // Use'domcontentloaded' for speed, then manually wait if needed
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Check if blocked by Cloudflare or similar
            const content = await page.content();
            if (content.includes('Cloudflare') || content.includes('Verify you are human')) {
                console.warn(`[Resolver] Blocked by Cloudflare at ${url}`);
                // Try to wait a bit to see if it auto-resolves
                await new Promise(r => setTimeout(r, 5000));
            }

            // Helper to find the best player iframe or video source
            const findStreamMeta = async () => {
                // Settle dynamic content
                await new Promise(r => setTimeout(r, 3000));

                return await page.evaluate(() => {
                    const iframes = Array.from(document.querySelectorAll('iframe'));
                    const candidates = iframes.map(i => ({
                        src: i.src || '',
                        width: i.offsetWidth,
                        height: i.offsetHeight,
                        id: i.id,
                        className: i.className
                    })).filter(i => {
                        const src = i.src.toLowerCase();
                        if (!src || src === 'about:blank') return false;
                        if (src.includes('chat') || src.includes('google') || src.includes('doubleclick') || src.includes('facebook')) return false;
                        return true;
                    });

                    // Sort by size
                    candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height));

                    const playerPatterns = [
                        'ballcontrol', 'vplayer', 'embed', 'box', 'player',
                        'stream', 'video', 'm3u8', 'clappr', 'jwplayer',
                        'sportsbest', 'vipleague', 'streameast', 'buffstreams'
                    ];

                    const best = candidates.find(c => {
                        const s = c.src.toLowerCase();
                        return playerPatterns.some(p => s.includes(p));
                    }) || candidates[0];

                    // Also check for direct video tags
                    const videoTag = document.querySelector('video source');
                    const videoSrc = videoTag ? (videoTag as HTMLSourceElement).src : null;

                    return {
                        iframeSrc: best ? best.src : null,
                        videoSrc: videoSrc,
                        title: document.title,
                        referer: window.location.href
                    };
                });
            };

            const meta = await findStreamMeta();
            let finalUrl = meta.videoSrc || meta.iframeSrc;

            // Drill into the iframe if it's a known wrapper
            if (finalUrl && (
                finalUrl.includes('totalsportek') ||
                finalUrl.includes('sportsurge') ||
                finalUrl.includes('redirect') ||
                finalUrl.includes('em.php')
            )) {
                console.log(`[Resolver] Drilling into wrapper: ${finalUrl}`);
                try {
                    await page.goto(finalUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    const deepMeta = await findStreamMeta();
                    if (deepMeta.iframeSrc || deepMeta.videoSrc) {
                        finalUrl = deepMeta.videoSrc || deepMeta.iframeSrc;
                        meta.referer = deepMeta.referer;
                    }
                } catch {
                    console.warn(`[Resolver] Deep drill failed for ${finalUrl}`);
                }
            }

            if (finalUrl) {
                // Clean URL
                if (finalUrl.startsWith('//')) finalUrl = 'https:' + finalUrl;

                console.log(`[Resolver] Success! Resolved to: ${finalUrl}`);
                return NextResponse.json({
                    url: finalUrl,
                    referer: meta.referer,
                    title: meta.title
                });
            } else {
                console.log(`[Resolver] No stream found, returning original URL`);
                return NextResponse.json({ url });
            }

        } catch (err) {
            console.error('[Resolver] Page processing error:', err);
            return NextResponse.json({ url });
        } finally {
            await browser.close();
        }

    } catch (error) {
        console.error('[Resolver] Global Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

