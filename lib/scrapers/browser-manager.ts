import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'puppeteer';

// @ts-ignore
puppeteer.use(StealthPlugin());

let sharedBrowser: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
    if (sharedBrowser && sharedBrowser.connected) {
        return sharedBrowser;
    }

    if (browserPromise) {
        return browserPromise;
    }

    browserPromise = (async () => {
        console.log('[BrowserManager] Launching new shared stealth browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        }) as any;

        sharedBrowser = browser;

        // Handle crash
        browser.on('disconnected', () => {
            console.log('[BrowserManager] Shared browser disconnected.');
            sharedBrowser = null;
            browserPromise = null;
        });

        return browser;
    })();

    return browserPromise;
}

export async function closeBrowser() {
    if (sharedBrowser) {
        await sharedBrowser.close();
        sharedBrowser = null;
        browserPromise = null;
    }
}
