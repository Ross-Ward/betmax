export interface ArbitrageOpportunity {
    id: string;
    sport: string;
    league: string;
    event: string;
    time: string;
    market: string;
    profit_percentage: number;
    bookmakers: {
        name: string;
        odds: number;
        outcome: string; // e.g. "Over 2.5", "Home", "Away"
        url?: string;
    }[];
    fetched_at: string;
    source: 'oddsportal' | 'oddspedia';
}
