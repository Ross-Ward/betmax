"use client";

import { useState, useMemo, useEffect } from "react";
import { Event } from "@/lib/types";
import { OddsTable } from "./odds-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeagueTable } from "@/components/data/league-table";
import { HorseMeetingView } from "@/components/data/horse-meeting-view";
import { GreyhoundMeetingView } from "@/components/data/greyhound-meeting-view";
import { cn } from "@/lib/utils";
import {
    Trophy,
    Target,
    Zap,
    Clock,
    Flag,
    Flame,
    Filter,
    Search as SearchIcon,
    ChevronRight,
    LayoutGrid,
    LineChart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const SPORTS = [
    {
        id: 'soccer',
        name: 'Soccer',
        icon: '⚽',
        leagues: [
            { id: 'pl_table', name: 'Premier League', region: 'UK' },
            { id: 'la_liga', name: 'La Liga', region: 'Spain' },
            { id: 'serie_a', name: 'Serie A', region: 'Italy' },
            { id: 'bundesliga', name: 'Bundesliga', region: 'Germany' },
            { id: 'ligue_1', name: 'Ligue 1', region: 'France' },
            { id: 'champions_league', name: 'Champions League', region: 'Europe' }
        ]
    },
    {
        id: 'nfl',
        name: 'NFL',
        icon: '🏈',
        leagues: [
            { id: 'nfl', name: 'NFL Regular Season', region: 'USA' }
        ]
    },
    {
        id: 'nhl',
        name: 'NHL',
        icon: '🏒',
        leagues: [
            { id: 'nhl', name: 'NHL Hockey', region: 'USA' }
        ]
    },
    {
        id: 'basketball',
        name: 'NBA',
        icon: '🏀',
        leagues: [
            { id: 'nba', name: 'NBA Regular Season', region: 'USA' },
            { id: 'nba_playoffs', name: 'NBA Playoffs', region: 'USA' }
        ]
    },
    {
        id: 'f1',
        name: 'Formula 1',
        icon: '🏎️',
        leagues: [
            { id: 'f1_driver_standings', name: 'Drivers Championship', region: 'Global' },
            { id: 'f1_constructor_standings', name: 'Constructors Title', region: 'Global' }
        ]
    },
    {
        id: 'horse',
        name: 'Racing',
        icon: '🏇',
        leagues: [
            { id: 'horse_racing_meetings', name: 'Live Meetings', region: 'UK/Ireland' },
            { id: 'jockey_standings', name: 'Jockey Leaderboard', region: 'UK' }
        ]
    },
    {
        id: 'greyhounds',
        name: 'Greyhounds',
        icon: '🐕',
        leagues: [
            { id: 'greyhound_races', name: 'Today\'s Racecards', region: 'UK/IRE' }
        ]
    },
    { id: 'ufc', name: 'UFC', icon: '🥋' },
    { id: 'golf', name: 'Golf', icon: '🏌️' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'boxing', name: 'Boxing', icon: '🥊' },
];


interface BettingDashboardProps {
    initialEvents: Event[];
    initialSport?: string;
}

export function BettingDashboard({ initialEvents, initialSport }: BettingDashboardProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [selectedSport, setSelectedSport] = useState<string | null>(initialSport || null);
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const [currentSeason, setCurrentSeason] = useState("2025/26");
    const [leagueData, setLeagueData] = useState<any>(null);
    const [isLoadingLeague, setIsLoadingLeague] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSport = !selectedSport ||
                event.sport_title.toLowerCase().includes(selectedSport.toLowerCase()) ||
                event.sport_key.toLowerCase().includes(selectedSport.toLowerCase());

            const matchesSearch = event.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.away_team.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSport && matchesSearch;
        });
    }, [events, selectedSport, searchQuery]);

    useEffect(() => {
        if (selectedLeague) {
            fetchLeagueData(selectedLeague, currentSeason);
        } else {
            setLeagueData(null);
        }
    }, [selectedLeague, currentSeason]);

    const fetchLeagueData = async (leagueId: string, season?: string) => {
        setIsLoadingLeague(true);
        try {
            const query = season ? `?season=${encodeURIComponent(season)}` : '';
            console.log(`[DASHBOARD] Fetching /api/datasets/${leagueId}${query}`);
            const res = await fetch(`/api/datasets/${leagueId}${query}`);
            const data = await res.json();
            console.log(`[DASHBOARD] Received data for ${leagueId}:`, Array.isArray(data) ? `Array with ${data.length} items` : typeof data, data);
            setLeagueData(data);
        } catch (e) {
            console.error('[DASHBOARD] Fetch error:', e);
        } finally {
            setIsLoadingLeague(false);
        }
    };

    const refreshData = async () => {
        setIsScraping(true);
        try {
            const res = await fetch('/api/betting');
            const data = await res.json();
            if (data.success) setEvents(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filter */}
            <aside className="lg:col-span-1 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-4 shadow-xl transition-all hover:shadow-2xl">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Top Sports</h3>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {SPORTS.map((sport) => (
                                <div key={sport.id} className="space-y-1">
                                    <Button
                                        variant={selectedSport === sport.id ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start gap-3 h-11 rounded-xl transition-all",
                                            selectedSport === sport.id ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                                        )}
                                        onClick={() => {
                                            if (selectedSport === sport.id) {
                                                setSelectedSport(null);
                                                setSelectedLeague(null);
                                            } else {
                                                setSelectedSport(sport.id);
                                                setSelectedLeague(null);
                                            }
                                        }}
                                    >
                                        <span className="text-lg">{sport.icon}</span>
                                        <span className="font-bold text-sm">{sport.name}</span>
                                        <ChevronRight className={cn("ml-auto h-3 w-3 transition-transform", selectedSport === sport.id && "rotate-90 text-primary")} />
                                    </Button>

                                    {selectedSport === sport.id && sport.leagues && (
                                        <div className="pl-4 pr-1 py-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            {sport.leagues.map((league) => (
                                                <button
                                                    key={league.id}
                                                    onClick={() => setSelectedLeague(league.id)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border border-transparent",
                                                        selectedLeague === league.id
                                                            ? "bg-primary/20 border-primary/20 text-primary"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        {league.name}
                                                        <LineChart className="h-3 w-3 opacity-50" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 shadow-lg border-primary/10">
                        <div className="flex items-center gap-3 mb-4 text-orange-500">
                            <Flame className="h-5 w-5 fill-current animate-pulse" />
                            <h3 className="font-bold italic uppercase tracking-tighter">Live Intel</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mb-4 leading-relaxed">
                            Click a sport and select a league to view live standings and advanced performance analytics.
                        </p>
                        <div className="space-y-3">
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-progress" style={{ width: '65%' }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                <span>Vault Health</span>
                                <span className="text-primary">98.2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 space-y-10">
                {/* Search & Tabs Header */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card/30 p-4 rounded-2xl border border-primary/5">
                    <div className="relative w-full md:w-96">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                            placeholder="Find teams, matches, or events..."
                            className="h-12 pl-12 rounded-xl border-2 border-transparent focus-visible:border-primary/20 bg-background/50 backdrop-blur-sm shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Tabs defaultValue="upcoming" className="w-full md:w-[280px]">
                            <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/20 p-1.5 rounded-lg border">
                                <TabsTrigger value="live" className="text-xs font-bold">Live</TabsTrigger>
                                <TabsTrigger value="upcoming" className="text-xs font-bold">Soon</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button
                            variant="default"
                            size="icon"
                            className="h-11 w-11 rounded-lg bg-primary shadow-lg shadow-primary/20"
                            onClick={refreshData}
                            disabled={isScraping}
                        >
                            <Zap className={cn("h-4 w-4 transition-all", isScraping && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Intelligence Layer: Standings/Meetings */}
                {selectedLeague && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        {isLoadingLeague ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-1/3" />
                                <Skeleton className="h-[400px] w-full rounded-2xl" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                        {SPORTS.find(s => s.id === selectedSport)?.leagues?.find(l => l.id === selectedLeague)?.name || 'League'}
                                    </h2>
                                </div>
                                {selectedLeague === 'horse_racing_meetings' ? (
                                    <HorseMeetingView data={leagueData} />
                                ) : selectedLeague === 'greyhound_races' ? (
                                    <GreyhoundMeetingView data={leagueData} />
                                ) : (
                                    <LeagueTable
                                        data={leagueData}
                                        title={SPORTS.find(s => s.id === selectedSport)?.leagues?.find(l => l.id === selectedLeague)?.name || ''}
                                        currentSeason={currentSeason}
                                        onSeasonChange={setCurrentSeason}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Odds Listings */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            <h2 className="text-xl font-black italic uppercase tracking-tight">
                                {selectedSport ? `${selectedSport.toUpperCase()} MARKETS` : 'TOP GLOBAL MARKETS'}
                            </h2>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-primary/5 border-primary/20 px-3">
                            {filteredEvents.length} LIVE OBJECTS
                        </Badge>
                    </div>

                    {filteredEvents.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <OddsTable events={filteredEvents} showLeague={!selectedLeague} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/5">
                            <Flag className="h-12 w-12 text-muted-foreground/20 mb-4" />
                            <h3 className="font-bold text-lg mb-1">No Real-Time Matches</h3>
                            <p className="text-muted-foreground text-sm">Our scrapers are scanning global feeds. Try another sport.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
