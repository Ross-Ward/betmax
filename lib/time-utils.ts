
import { format, isDate, parseISO, isValid } from 'date-fns';

export function parseEventTime(timeInput: string | number | undefined): { display: string; isLive: boolean; isEnded: boolean; timestamp: number } {
    const now = new Date();

    // Default fallback
    const fallback = { display: "TBD", isLive: false, isEnded: false, timestamp: 0 };

    if (!timeInput) return fallback;

    // Handle "Live" strings
    if (typeof timeInput === 'string') {
        const lower = timeInput.toLowerCase();
        if (lower.includes('live') || lower === 'now' || lower.includes('started') || lower.includes("'") || lower.includes("ht")) {
            return { display: "LIVE", isLive: true, isEnded: false, timestamp: now.getTime() };
        }
    }

    let date: Date | null = null;

    // Try parsing
    if (typeof timeInput === 'number') {
        // Assume Unix timestamp (seconds or ms)
        // If < 10000000000, probably seconds
        if (timeInput < 10000000000) {
            date = new Date(timeInput * 1000);
        } else {
            date = new Date(timeInput);
        }
    } else if (typeof timeInput === 'string') {
        // Handle "HH:mm" format (e.g. "14:30")
        if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
            const [hours, minutes] = timeInput.split(':').map(Number);
            const d = new Date();
            d.setHours(hours, minutes, 0, 0);

            // If time is more than 6 hours in the past, assume it's for tomorrow
            // (Scrapers often return upcoming matches only)
            if (d.getTime() < now.getTime() - (6 * 60 * 60 * 1000)) {
                d.setDate(d.getDate() + 1);
            }
            date = d;
        } else {
            // Try ISO
            const parsed = parseISO(timeInput);
            if (isValid(parsed)) {
                date = parsed;
            } else {
                // Try new Date() constructor for other formats
                const d = new Date(timeInput);
                if (isValid(d)) date = d;
            }
        }
    }

    if (!date || !isValid(date)) return { ...fallback, display: String(timeInput) };

    const timestamp = date.getTime();
    const diffHours = (now.getTime() - timestamp) / (1000 * 60 * 60);

    // Is Live? (Started within last 3 hours, or specifically marked)
    // Actually, simple time-based "Live" is risky without status, but if it started < 3 hours ago and > 0 mins ago
    const isStarted = diffHours > 0;
    const isEnded = diffHours > 3.5; // Assume 3.5h max duration
    const isLive = isStarted && !isEnded;

    // Format for display
    // e.g. "14:30" or "Tomorrow 14:30"
    let display = "";

    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const isTomorrow = new Date(now.getTime() + 86400000).getDate() === date.getDate();

    if (isToday) {
        display = format(date, 'HH:mm');
    } else if (isTomorrow) {
        display = `Tmrw ${format(date, 'HH:mm')}`;
    } else {
        display = format(date, 'MMM d, HH:mm');
    }

    return {
        display,
        isLive,
        isEnded,
        timestamp
    };
}
