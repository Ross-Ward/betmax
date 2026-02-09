/**
 * Unified Sports Data Schema
 * This defines how we store our "Dataset" of sports information.
 */

export type SportType = 'soccer' | 'mma' | 'boxing' | 'kickboxing' | 'muay-thai' | 'grappling' | 'golf' | 'f1' | 'horse-racing' | 'basketball' | 'nfl' | 'cricket' | 'greyhounds';

export interface Participant {
    id: string;
    name: string;
    type: 'team' | 'individual' | 'animal' | 'driver';
    sport: SportType;
    country?: string;
    logo_url?: string;
    stats?: Record<string, any>;
    rankings?: Record<string, number | string>;
    metadata?: Record<string, any>;
}

export interface Season {
    id: string;
    sport: SportType;
    year: string;
    name: string; // e.g., "Premier League 2023/24"
}

export interface TableEntry {
    participant_id: string;
    participant_name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    goals_for?: number;
    goals_against?: number;
    form?: string[]; // e.g., ['W', 'D', 'L', 'W', 'W']
}

export interface CompetitionTable {
    id: string;
    season_id: string;
    entries: TableEntry[];
    last_updated: string;
}

export interface Ranking {
    id: string;
    sport: SportType;
    category: string; // e.g., "Heavyweight", "Pound for Pound", "World Ranking"
    entries: {
        rank: number;
        participant_id: string;
        participant_name: string;
        points?: number;
        change?: number;
    }[];
    last_updated: string;
}

export interface DataEvent {
    id: string;
    sport: SportType;
    season_id?: string;
    name: string;
    venue?: string;
    start_time: string;
    status: 'scheduled' | 'live' | 'finished' | 'cancelled';
    participants: {
        id: string;
        name: string;
        score?: number | string;
        result?: 'win' | 'loss' | 'draw' | 'null';
        metadata?: Record<string, any>;
    }[];
    metadata?: Record<string, any>;
}
