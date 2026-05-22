"use client"

import { useState, useMemo, useEffect } from "react"
import { Event } from "@/lib/types"
import { StreamsTab } from "@/components/streams/streams-tab"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { StreamPlayer } from "@/components/streams/stream-player"
import { StreamLink } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LiveDashboardProps {
    events: Event[]
}

import { useRouter, useSearchParams } from 'next/navigation'
import { useStream } from "@/lib/stream-context"
import { Search, Flame, Trophy, Activity, Target, Zap, Globe, LayoutGrid, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { parseEventTime } from "@/lib/time-utils"

const FIXED_CATEGORIES = [
    { name: "All Sports", icon: LayoutGrid },
    { name: "Soccer", icon: Trophy },
    { name: "NBA", icon: Activity },
    { name: "NFL", icon: Activity },
    { name: "NHL", icon: Activity },
    { name: "Formula 1", icon: Zap },
    { name: "MotoGP", icon: Zap },
    { name: "UFC", icon: Flame },
    { name: "Boxing", icon: Zap },
    { name: "Tennis", icon: Globe },
    { name: "Horse Racing", icon: Target },
];

export function LiveDashboard({ events }: LiveDashboardProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialCategory = searchParams.get('sport') || 'All Sports'
    const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
    const [searchQuery, setSearchQuery] = useState("")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [filterMode, setFilterMode] = useState<'ALL' | 'LIVE' | 'HOT' | 'FAV'>('ALL')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from local storage
    useEffect(() => {
        const saved = localStorage.getItem('betmax_favorites')
        if (saved) {
            try {
                setFavorites(JSON.parse(saved))
            } catch (e) { }
        }
    }, [])

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
            localStorage.setItem('betmax_favorites', JSON.stringify(next))
            return next
        })
    }

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsRefreshing(true);
            router.refresh();
            setTimeout(() => setIsRefreshing(false), 2000);
        }, 60000);
        return () => clearInterval(interval);
    }, [router]);

    const { openStream } = useStream()

    // Category Counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { "All Sports": events.length };

        const catMap: Record<string, string[]> = {
            "NBA": ["NBA", "Basketball"],
            "NFL": ["NFL", "American Football"],
            "NHL": ["NHL", "Hockey"],
            "Soccer": ["Soccer", "Football", "Premier League", "La Liga", "Serie A", "Bundesliga"],
            "Formula 1": ["Formula 1", "F1"],
            "MotoGP": ["MotoGP", "Motorsport"],
            "UFC": ["UFC", "MMA", "Martial Arts", "WWE"],
            "Boxing": ["Boxing"],
            "Tennis": ["Tennis"],
            "Horse Racing": ["Horse Racing", "Horseracing"],
        };

        FIXED_CATEGORIES.forEach(cat => {
            if (cat.name === "All Sports") return;
            const targetTitles = catMap[cat.name] || [cat.name];
            counts[cat.name] = events.filter(e =>
                targetTitles.some(title =>
                    (e.sport_title || "").toLowerCase().includes(title.toLowerCase()) ||
                    (e.sport_key || "").toLowerCase().includes(title.toLowerCase()) ||
                    (e.league?.name || "").toLowerCase().includes(title.toLowerCase())
                )
            ).length;
        });

        return counts;
    }, [events]);

    // Filter and Sort events
    const processedEvents = useMemo(() => {
        // Remove duplicates and template events (those with 'Unknown Team' or similar)
        const uniqueEvents = Array.from(
            events.reduce((map, event) => {
                const isTemplate = (event.home_team || "").toLowerCase().includes('unknown') ||
                    (event.away_team || "").toLowerCase().includes('unknown') ||
                    (event.name || "").toLowerCase().includes('unknown');

                if (!isTemplate && !map.has(event.id)) {
                    map.set(event.id, event);
                }
                return map;
            }, new Map<string, Event>()).values()
        );

        let filtered = uniqueEvents

        // 1. Category Filter
        if (activeCategory !== "All Sports") {
            const catMap: Record<string, string[]> = {
                "NBA": ["NBA", "Basketball"],
                "NFL": ["NFL", "American Football"],
                "NHL": ["NHL", "Hockey"],
                "Soccer": ["Soccer", "Football", "Premier League", "La Liga", "Serie A", "Bundesliga"],
                "Formula 1": ["Formula 1", "F1"],
                "MotoGP": ["MotoGP", "Motorsport"],
                "UFC": ["UFC", "MMA", "Martial Arts", "WWE"],
                "Boxing": ["Boxing"],
                "Tennis": ["Tennis"],
                "Horse Racing": ["Horse Racing", "Horseracing"],
            };

            const targetTitles = catMap[activeCategory] || [activeCategory];
            filtered = uniqueEvents.filter(e =>
                targetTitles.some(title =>
                    (e.sport_title || "").toLowerCase().includes(title.toLowerCase()) ||
                    (e.sport_key || "").toLowerCase().includes(title.toLowerCase()) ||
                    (e.league?.name || "").toLowerCase().includes(title.toLowerCase())
                )
            )
        } else {
            // In "All Sports", limit Horse Racing to avoid taking up the whole page
            const horseRaces = uniqueEvents.filter(e =>
                (e.sport_title || "").toLowerCase().includes('horse')
            );
            const otherEvents = uniqueEvents.filter(e =>
                !(e.sport_title || "").toLowerCase().includes('horse')
            );

            filtered = [...otherEvents, ...horseRaces.slice(0, 5)];
        }

        // 2. Mode Filter (Live, Hot, Fav)
        if (filterMode === 'LIVE') {
            filtered = filtered.filter(e => {
                const { isLive } = parseEventTime(e.commence_time);
                return isLive;
            });
        } else if (filterMode === 'HOT') {
            // Hot = Live OR Top Leagues
            filtered = filtered.filter(e => {
                const { isLive } = parseEventTime(e.commence_time);
                if (isLive) return true;
                const league = (e.league?.name || "").toLowerCase();
                const sport = (e.sport_title || "").toLowerCase();
                return league.includes('premier') || league.includes('nba') || league.includes('nfl') || league.includes('champion') || sport.includes('ufc');
            });
        } else if (filterMode === 'FAV') {
            filtered = filtered.filter(e => favorites.includes(e.id));
        }

        // 3. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(e =>
                (e.name || "").toLowerCase().includes(q) ||
                (e.home_team || "").toLowerCase().includes(q) ||
                (e.away_team || "").toLowerCase().includes(q) ||
                (e.sport_title || "").toLowerCase().includes(q)
            )
        }

        console.log(`[Dashboard] Total: ${events.length}, Unique: ${uniqueEvents.length}, Visible: ${filtered.length}, Mode: ${filterMode}`);
        return filtered
    }, [events, activeCategory, searchQuery, filterMode, favorites])

    return (
        <div className="min-h-screen bg-[#0f141d] text-zinc-100 p-4 sm:p-8 space-y-10">
            {/* Header / Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search games, teams or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#1a212d] border-white/5 pl-11 h-12 rounded-xl focus-visible:ring-primary/50 text-sm placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setIsRefreshing(true);
                            router.refresh();
                            setTimeout(() => setIsRefreshing(false), 2000);
                        }}
                        className="bg-[#1a212d] border border-white/5 rounded-xl h-9 w-9 text-zinc-400 hover:text-white"
                        title="Refresh Events"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setFilterMode(prev => prev === 'LIVE' ? 'ALL' : 'LIVE')}
                        className={cn(
                            "bg-[#1a212d] border border-white/5 rounded-xl px-4 text-xs font-bold gap-2 transition-all",
                            filterMode === 'LIVE' && "bg-orange-500/10 text-orange-500 border-orange-500/50"
                        )}
                    >
                        <Flame className={cn("h-3.5 w-3.5", filterMode === 'LIVE' ? "text-orange-500" : "text-zinc-500")} />
                        Live Only
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setFilterMode(prev => prev === 'HOT' ? 'ALL' : 'HOT')}
                        className={cn(
                            "bg-[#1a212d] border border-white/5 rounded-xl px-4 text-xs font-bold gap-2 transition-all",
                            filterMode === 'HOT' && "bg-blue-500/10 text-blue-500 border-blue-500/50"
                        )}
                    >
                        <Activity className={cn("h-3.5 w-3.5", filterMode === 'HOT' ? "text-blue-500" : "text-zinc-500")} />
                        Hot Games
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setFilterMode(prev => prev === 'FAV' ? 'ALL' : 'FAV')}
                        className={cn(
                            "bg-[#1a212d] border border-white/5 rounded-xl px-4 text-xs font-bold gap-2 transition-all",
                            filterMode === 'FAV' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/50"
                        )}
                    >
                        <Target className={cn("h-3.5 w-3.5", filterMode === 'FAV' ? "text-yellow-500" : "text-zinc-500")} />
                        Favorites ({favorites.length})
                    </Button>
                </div>
            </div>

            {/* Sport Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
                {FIXED_CATEGORIES.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => { setActiveCategory(cat.name); setFilterMode('ALL'); }}
                        className={cn(
                            "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 relative group",
                            activeCategory === cat.name
                                ? "bg-[#1e2736] border-primary/50 text-white shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                : "bg-[#161d27] border-white/5 text-zinc-500 hover:border-white/10 hover:bg-[#1a212d]"
                        )}
                    >
                        {/* Count Badge */}
                        {categoryCounts[cat.name] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-in zoom-in duration-300">
                                {categoryCounts[cat.name]}
                            </span>
                        )}

                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            activeCategory === cat.name ? "bg-primary/20 text-primary" : "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                        )}>
                            <cat.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                    </button>
                ))}
            </div>

            <div className="max-w-7xl mx-auto pt-4">
                <StreamsTab
                    events={processedEvents}
                    sportTitle={activeCategory}
                    onWatch={(stream, all) => openStream(stream, all)}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            </div>

            <div className="text-center text-[10px] text-zinc-700 font-mono py-4 opacity-50 hover:opacity-100 transition-opacity">
                DEBUG: Total: {events.length} | Unique: {Array.from(new Set(events.map(e => e.id))).length} | Visible: {processedEvents.length} | Cat: {activeCategory} | Mode: {filterMode} | Favs: {favorites.length}
            </div>
        </div>
    )
}
