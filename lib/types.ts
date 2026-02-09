export interface Sport {
    key: string;
    group: string;
    title: string;
    description: string;
    active: boolean;
    has_outrights: boolean;
}

export interface League {
    id: string;
    name: string;
    sport: string;
    country: string;
    logo?: string;
}

export interface StreamLink {
    streamer: string;
    link_name: string;
    url: string;
    mobile: string; // 'yes' or 'no'
    quality: string; // 'HD', 'SD', etc.
    ads: number;
    language: string;
    note?: string; // Optional warning or info about the stream
    referer?: string; // Original source for forbidden links
    headers?: Record<string, string>; // Extra headers if needed
}

export interface Event {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string; // ISO string or descriptive text like "Live Now"
    commence_time_timestamp?: number; // Unix timestamp for sorting/filtering
    home_team: string;
    away_team: string;
    league: League;
    bookmakers: Bookmaker[];
    streams?: StreamLink[];
    url?: string;
    source?: string;
    images?: string[];
    name?: string; // Full event name
    venue?: string;
}

export interface Bookmaker {
    key: string;
    title: string;
    last_update: string;
    markets: Market[];
}

export interface Market {
    key: string; // e.g., 'h2h', 'spreads', 'totals'
    last_update: string;
    outcomes: Outcome[];
}

export interface Outcome {
    name: string;
    price: number;
    point?: number; // for spreads/totals
}

export interface Odd {
    bookmaker_key: string;
    bookmaker_title: string;
    price: number;
    point?: number;
}
