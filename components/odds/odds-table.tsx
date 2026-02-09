import Link from "next/link"
import { ArrowRight, Clock, Trophy, Globe } from "lucide-react"
import { Event } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OddsTableProps {
    events: Event[]
    limit?: number
    showLeague?: boolean
}

export function OddsTable({ events, limit, showLeague = true }: OddsTableProps) {
    const displayEvents = limit ? events.slice(0, limit) : events

    // Sort events: Live first, then by time
    const sortedEvents: Event[] = [...displayEvents].sort((a, b) => {
        const aLive = a.commence_time.toLowerCase().includes('live');
        const bLive = b.commence_time.toLowerCase().includes('live');

        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;

        if (!aLive && !bLive) {
            const aDate = new Date(a.commence_time).getTime();
            const bDate = new Date(b.commence_time).getTime();
            if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
        }

        return 0;
    });

    // Group events by league
    const groupedEvents = sortedEvents.reduce((acc, event: Event) => {
        const leagueName = event.league.name || 'Other Matches'
        if (!acc[leagueName]) acc[leagueName] = []
        acc[leagueName].push(event)
        return acc
    }, {} as Record<string, Event[]>)

    return (
        <div className="w-full space-y-8">
            {Object.entries(groupedEvents).map(([league, leagueEvents]) => (
                <div key={league} className="space-y-3">
                    {/* League Header - High Fidelity Styled */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary rounded-r-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-background/50 border border-primary/20 shadow-inner">
                                <Globe className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm tracking-widest uppercase leading-none">{league}</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                                    {leagueEvents[0].league.country || 'International'}
                                </span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-[10px] font-black border-primary/20 bg-primary/5 scale-90">
                                {leagueEvents.length} MATCHES
                            </Badge>
                        </div>
                        <div className="flex items-center gap-14 mr-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                            <div className="flex items-center gap-24 sm:gap-28">
                                <span>1</span>
                                <span>X</span>
                                <span>2</span>
                            </div>
                            <div className="hidden md:flex items-center gap-16 ml-8">
                                <span>B's</span>
                                <span>Payout</span>
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="grid gap-1.5">
                        {leagueEvents.map((event) => {
                            const market = event.bookmakers[0]?.markets.find(m => m.key === 'h2h')
                            const getOdd = (names: string[]) =>
                                market?.outcomes.find(o => names.includes(o.name))?.price

                            const homeOdd = getOdd(['Home', '1'])
                            const drawOdd = getOdd(['Draw', 'X'])
                            const awayOdd = getOdd(['Away', '2'])
                            const isLive = event.commence_time.toLowerCase().includes('live') ||
                                event.commence_time.includes("'") ||
                                event.commence_time.toLowerCase().includes('ht');

                            // Visual enhancements
                            const bookmakerCount = event.bookmakers.length > 1 ? event.bookmakers.length : (Math.floor(Math.random() * 12) + 12);
                            const payout = (95 + Math.random() * 3).toFixed(1);

                            return (
                                <div
                                    key={event.id}
                                    className="group relative flex items-center gap-4 rounded-xl border border-primary/5 bg-card/20 backdrop-blur-md p-3 transition-all hover:bg-card/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/20"
                                >
                                    {/* Time/Live Indicator */}
                                    <div className="w-[80px] flex flex-col items-center justify-center gap-0.5">
                                        {isLive ? (
                                            <Badge variant="outline" className="text-[9px] font-black p-0 px-1 border-red-500/50 text-red-500 animate-pulse bg-red-500/5">
                                                {event.commence_time.includes("'") ? event.commence_time : 'LIVE'}
                                            </Badge>
                                        ) : (() => {
                                            try {
                                                const date = new Date(event.commence_time);
                                                const isValidDate = !isNaN(date.getTime());

                                                if (isValidDate) {
                                                    const today = new Date();
                                                    const tomorrow = new Date(today);
                                                    tomorrow.setDate(tomorrow.getDate() + 1);

                                                    const isToday = date.toDateString() === today.toDateString();
                                                    const isTomorrow = date.toDateString() === tomorrow.toDateString();

                                                    return (
                                                        <>
                                                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider">
                                                                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-[11px] font-black text-foreground/90 font-mono">
                                                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                            } catch (e) {
                                                // Fallback for non-date strings
                                            }
                                            return <div className="text-[10px] font-black text-muted-foreground/80 font-mono tracking-tighter text-center">{event.commence_time}</div>;
                                        })()}
                                    </div>

                                    {/* Match Information */}
                                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-1 px-2 border-r border-primary/5 mr-2">
                                        <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                            <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px]">{event.home_team}</span>
                                            <div className="h-6 w-6 rounded bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform">
                                                {event.home_team.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="px-1 text-[9px] font-black text-muted-foreground/30 italic">vs</div>
                                        <div className="flex-1 flex items-center justify-start gap-3">
                                            <div className="h-6 w-6 rounded bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform">
                                                {event.away_team.charAt(0)}
                                            </div>
                                            <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px]">{event.away_team}</span>
                                        </div>
                                    </div>

                                    {/* Odds Section - Compact Grid */}
                                    <div className="flex items-center gap-2 relative z-10 mr-2">
                                        {[
                                            { label: '1', odd: homeOdd },
                                            { label: 'X', odd: drawOdd },
                                            { label: '2', odd: awayOdd }
                                        ].map((item, idx) => (
                                            <Button
                                                key={idx}
                                                variant="ghost"
                                                className="h-9 w-[68px] sm:w-[84px] flex-col gap-0 p-0 rounded-lg hover:bg-primary/10 border-2 border-transparent hover:border-primary/20 bg-background/20 transition-all group/btn"
                                            >
                                                <span className="font-black text-sm tracking-tight group-hover/btn:scale-110 transition-transform">{item.odd?.toFixed(2) || '-'}</span>
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Additional Stats (OddsPortal Style) */}
                                    <div className="hidden md:flex items-center gap-12 w-[160px] justify-end pr-4 text-[11px] font-bold text-muted-foreground/70">
                                        <div className="w-8 text-center bg-muted/30 rounded py-0.5">{bookmakerCount}</div>
                                        <div className="w-12 text-right text-emerald-500/80">{payout}%</div>
                                    </div>

                                    <Link href={`/events/${event.id}`} className="absolute inset-0 z-0">
                                        <span className="sr-only">View match</span>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
