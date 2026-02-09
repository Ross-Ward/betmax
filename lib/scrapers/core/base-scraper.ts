import { Page } from 'puppeteer';

export abstract class BaseScraper<T> {
    protected browser: any | null = null;
    protected page: Page | null = null;

    constructor(protected sourceUrl: string, protected sportName: string) { }

    async init() {
        console.log(`[SCRAPER] Initializing browser for ${this.sportName}...`);
        try {
            console.log('[SCRAPER] importing puppeteer-extra...');
            const { default: puppeteer } = await import('puppeteer-extra');
            console.log('[SCRAPER] importing stealth plugin...');
            const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
            console.log('[SCRAPER] plugins imported.');

            puppeteer.use(StealthPlugin());

            console.log('[SCRAPER] Launching puppeteer...');
            this.browser = await puppeteer.launch({
                headless: true,
                dumpio: true, // Enable stdout/stderr from chrome
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                    '--disable-blink-features=AutomationControlled' // Extra stealth
                ]
            });
            console.log('[SCRAPER] Puppeteer launched.');

            this.page = await this.browser.newPage();
            console.log('[SCRAPER] New page created.');
            if (this.page) {
                await this.page.setViewport({ width: 1920, height: 1080 });
                // Randomize User-Agent slightly
                const userAgents = [
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
                ];
                await this.page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
                console.log('[SCRAPER] User agent set.');
            }
        } catch (error) {
            console.error(`[SCRAPER] Initialization crash:`, error);
            throw error;
        }
    }

    async handleModals() {
        if (!this.page) return;
        await new Promise(r => setTimeout(r, 2000));
        try {
            await this.page.evaluate(() => {
                const rejectSelectors = [
                    '#onetrust-reject-all-handler', '.cky-btn-reject',
                    'button[id*="reject"]', 'button[class*="reject"]',
                    'button[id*="essential"]', 'button[class*="essential"]',
                    '[aria-label*="Reject"]', '[title*="Reject"]'
                ];
                for (const selector of rejectSelectors) {
                    const btn = document.querySelector(selector) as HTMLElement;
                    if (btn) { btn.click(); return true; }
                }
                const buttons = Array.from(document.querySelectorAll('button'));
                const target = buttons.find(b =>
                    b.innerText.toLowerCase().includes('reject') ||
                    b.innerText.toLowerCase().includes('essential only') ||
                    b.innerText.toLowerCase().includes('necessary only')
                );
                if (target) { target.click(); return true; }
                return false;
            });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e: any) {
            console.warn(`[SCRAPER] Modal handler failed:`, e.message);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    abstract scrape(): Promise<T>;
    abstract getSimulationData(): T;

    async optimizePage() {
        if (!this.page) return;
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            if (['image', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    async waitFor(selector: string, timeout = 15000): Promise<boolean> {
        if (!this.page) return false;
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch (e) {
            console.warn(`[SCRAPER] Timeout waiting for ${selector}`);
            return false;
        }
    }
}
