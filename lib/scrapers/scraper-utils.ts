/**
 * Scraper Utilities - Anti-Detection & Reliability Features
 * Provides user-agent rotation, header randomization, and request management
 */

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'en-US,en;q=0.9,es;q=0.8',
    'en-GB,en-US;q=0.9,en;q=0.8'
];

const ACCEPT_ENCODINGS = [
    'gzip, deflate, br',
    'gzip, deflate, br, zstd'
];

/**
 * Get a random user agent from the pool
 */
export function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Get randomized browser headers
 */
export function getRandomHeaders(referer?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': ACCEPT_LANGUAGES[Math.floor(Math.random() * ACCEPT_LANGUAGES.length)],
        'Accept-Encoding': ACCEPT_ENCODINGS[Math.floor(Math.random() * ACCEPT_ENCODINGS.length)],
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
    };

    if (referer) {
        headers['Referer'] = referer;
        headers['Sec-Fetch-Site'] = 'same-origin';
    }

    return headers;
}

/**
 * Get a random delay between min and max milliseconds
 */
export function getRandomDelay(min: number = 800, max: number = 3000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for a random amount of time
 */
export async function randomSleep(min: number = 800, max: number = 3000): Promise<void> {
    const delay = getRandomDelay(min, max);
    await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Circuit breaker for tracking scraper failures
 */
class CircuitBreaker {
    private failures: Map<string, number> = new Map();
    private lastAttempt: Map<string, number> = new Map();
    private readonly maxFailures: number = 3;
    private readonly resetTimeout: number = 5 * 60 * 1000; // 5 minutes

    isOpen(key: string): boolean {
        const failures = this.failures.get(key) || 0;
        const lastAttempt = this.lastAttempt.get(key) || 0;
        const now = Date.now();

        // Reset if enough time has passed
        if (now - lastAttempt > this.resetTimeout) {
            this.failures.set(key, 0);
            return false;
        }

        return failures >= this.maxFailures;
    }

    recordSuccess(key: string): void {
        this.failures.set(key, 0);
        this.lastAttempt.set(key, Date.now());
    }

    recordFailure(key: string): void {
        const current = this.failures.get(key) || 0;
        this.failures.set(key, current + 1);
        this.lastAttempt.set(key, Date.now());
    }

    getStatus(key: string): { failures: number; isOpen: boolean } {
        return {
            failures: this.failures.get(key) || 0,
            isOpen: this.isOpen(key)
        };
    }
}

export const scraperCircuitBreaker = new CircuitBreaker();

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                const delay = initialDelay * Math.pow(2, i);
                console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Execute with timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutError: string = 'Operation timed out'
): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(timeoutError));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutHandle!);
    }
}

/**
 * Cookie manager for persisting cookies across requests
 */
class CookieManager {
    private cookies: Map<string, string[]> = new Map();

    setCookies(domain: string, cookies: string[]): void {
        this.cookies.set(domain, cookies);
    }

    getCookies(domain: string): string[] {
        return this.cookies.get(domain) || [];
    }

    clearCookies(domain: string): void {
        this.cookies.delete(domain);
    }

    getCookieString(domain: string): string {
        const cookies = this.getCookies(domain);
        return cookies.join('; ');
    }
}

export const cookieManager = new CookieManager();

/**
 * Request deduplication - prevents duplicate requests within a time window
 */
class RequestDeduplicator {
    private pending: Map<string, Promise<any>> = new Map();
    private lastRequest: Map<string, number> = new Map();
    private readonly minInterval: number = 30000; // 30 seconds

    async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
        // Check if request is too recent
        const lastTime = this.lastRequest.get(key) || 0;
        const now = Date.now();

        if (now - lastTime < this.minInterval) {
            console.log(`[DEDUP] Skipping duplicate request for ${key} (too recent)`);
            throw new Error('Request too recent, using cache');
        }

        // Check if request is already pending
        const pending = this.pending.get(key);
        if (pending) {
            console.log(`[DEDUP] Attaching to pending request for ${key}`);
            return pending;
        }

        // Execute new request
        const promise = fn();
        this.pending.set(key, promise);

        try {
            const result = await promise;
            this.lastRequest.set(key, Date.now());
            return result;
        } finally {
            this.pending.delete(key);
        }
    }
}

export const requestDeduplicator = new RequestDeduplicator();
