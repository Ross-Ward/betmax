import * as fs from 'fs';
import * as path from 'path';

export interface QueueItem {
    url: string;
    type: 'ranking' | 'event' | 'fighter';
    sport: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    lastError?: string;
    retries: number;
    metadata?: any;
}

export class ScrapeQueue {
    private items: Map<string, QueueItem> = new Map();
    private storagePath: string;

    constructor(storageDir: string) {
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        this.storagePath = path.join(storageDir, 'scrape_queue.json');
        this.load();
    }

    private load() {
        if (fs.existsSync(this.storagePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
                Object.entries(data).forEach(([url, item]: [string, any]) => {
                    this.items.set(url, item);
                });
                console.log(`[QUEUE] Loaded ${this.items.size} items from disk.`);
            } catch (e) {
                console.error('[QUEUE] Failed to load queue:', e);
            }
        }
    }

    private save() {
        try {
            const data = Object.fromEntries(this.items);
            fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('[QUEUE] Failed to save queue:', e);
        }
    }

    public add(url: string, type: QueueItem['type'], sport: string, metadata?: any) {
        if (!this.items.has(url)) {
            this.items.set(url, {
                url,
                type,
                sport,
                status: 'pending',
                retries: 0,
                metadata
            });
            this.save();
        }
    }

    public getNext(type?: QueueItem['type']): QueueItem | null {
        for (const item of this.items.values()) {
            if (item.status === 'pending' || (item.status === 'failed' && item.retries < 3)) {
                if (!type || item.type === type) return item;
            }
        }
        return null;
    }

    public updateStatus(url: string, status: QueueItem['status'], error?: string) {
        const item = this.items.get(url);
        if (item) {
            item.status = status;
            if (error) {
                item.lastError = error;
                item.retries++;
            }
            this.save();
        }
    }

    public getPendingCount(type?: QueueItem['type']): number {
        let count = 0;
        this.items.forEach(item => {
            if ((item.status === 'pending' || (item.status === 'failed' && item.retries < 3)) && (!type || item.type === type)) {
                count++;
            }
        });
        return count;
    }

    public getStats() {
        const stats = {
            total: this.items.size,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            byType: {} as Record<string, number>
        };
        this.items.forEach(item => {
            if (item.status === 'pending') stats.pending++;
            else if (item.status === 'processing') stats.processing++;
            else if (item.status === 'completed') stats.completed++;
            else if (item.status === 'failed') stats.failed++;

            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });
        return stats;
    }

    public clear() {
        this.items.clear();
        this.save();
    }
}
