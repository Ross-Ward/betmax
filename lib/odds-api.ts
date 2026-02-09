// The Odds API integration for real betting odds
// Free tier: 500 requests/month
// Docs: https://the-odds-api.com/

import { Event } from '@/lib/types';

const API_KEY = 'demo'; // Using demo key for testing - user should replace with their own
const BASE_URL = 'https://api.the-odds-api.com/v4';

export async function getOddsFromAPI(): Promise<Event[]> {
    try {
        // Get upcoming soccer matches with odds
        const response = await fetch(
            `${BASE_URL}/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=us,uk&markets=h2h,totals&oddsFormat=decimal`,
            { next: { revalidate: 300 } } // Cache for 5 minutes
        );

        if (!response.ok) {
            console.error('Odds API error:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();

        // Transform API data to our Event format
        const events: Event[] = data.map((game: any) => ({
            id: game.id,
            sport_key: game.sport_key,
            sport_title: game.sport_title,
            commence_time: game.commence_time,
            home_team: game.home_team,
            away_team: game.away_team,
            league: {
                id: game.sport_key,
                name: game.sport_title,
                sport: game.sport_key,
                country: 'International'
            },
            bookmakers: game.bookmakers?.map((bookie: any) => ({
                key: bookie.key,
                title: bookie.title,
                last_update: bookie.last_update,
                markets: bookie.markets?.map((market: any) => ({
                    key: market.key,
                    last_update: market.last_update || bookie.last_update,
                    outcomes: market.outcomes?.map((outcome: any) => ({
                        name: outcome.name,
                        price: outcome.price,
                        point: outcome.point
                    })) || []
                })) || []
            })) || [],
            streams: []
        }));

        return events;
    } catch (error) {
        console.error('Failed to fetch from Odds API:', error);
        return [];
    }
}

// Get odds for multiple sports
export async function getMultiSportOdds(): Promise<Event[]> {
    const sports = ['soccer_epl', 'basketball_nba', 'americanfootball_nfl'];
    const allEvents: Event[] = [];

    for (const sport of sports) {
        try {
            const response = await fetch(
                `${BASE_URL}/sports/${sport}/odds/?apiKey=${API_KEY}&regions=us,uk&markets=h2h&oddsFormat=decimal`,
                { next: { revalidate: 300 } }
            );

            if (response.ok) {
                const data = await response.json();
                const events = data.slice(0, 3).map((game: any) => ({
                    id: game.id,
                    sport_key: game.sport_key,
                    sport_title: game.sport_title,
                    commence_time: game.commence_time,
                    home_team: game.home_team,
                    away_team: game.away_team,
                    league: {
                        id: game.sport_key,
                        name: game.sport_title,
                        sport: game.sport_key,
                        country: 'International'
                    },
                    bookmakers: game.bookmakers?.map((bookie: any) => ({
                        key: bookie.key,
                        title: bookie.title,
                        last_update: bookie.last_update,
                        markets: bookie.markets?.map((market: any) => ({
                            key: market.key,
                            last_update: market.last_update || bookie.last_update,
                            outcomes: market.outcomes?.map((outcome: any) => ({
                                name: outcome.name,
                                price: outcome.price,
                                point: outcome.point
                            })) || []
                        })) || []
                    })) || [],
                    streams: []
                }));
                allEvents.push(...events);
            }
        } catch (e) {
            console.error(`Failed to fetch ${sport}:`, e);
        }
    }

    return allEvents;
}
