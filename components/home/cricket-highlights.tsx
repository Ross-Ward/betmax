import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCricketEvents } from "@/lib/scrapers"
import { Activity, MapPin, Search } from "lucide-react"
import { Event } from "@/lib/types"
import Link from "next/link"

export async function CricketHighlights() {
    let events: Event[] = []
    try {
        events = await getCricketEvents()
    } catch (error) {
        console.error('[CricketHighlights] Error fetching data:', error)
    }

    const liveMatches = events.filter((e) =>
        e.commence_time?.toLowerCase().includes('live')
    ).slice(0, 3)

    const upcomingMatches = events.filter((e) =>
        e.commence_time?.toLowerCase().includes('upcoming') ||
        e.commence_time?.toLowerCase().includes('scheduled')
    ).slice(0, 3)

    const displayMatches = [...liveMatches, ...upcomingMatches].slice(0, 4)

    return (
        <section className="py-10">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2 text-white">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Cricket Matches</h2>
                    </div>
                    <Link href="/sports/cricket" className="text-sm text-primary hover:underline font-medium">
                        All Cricket →
                    </Link>
                </div>

                {displayMatches.length === 0 ? (
                    <Card className="border-dashed border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No live or upcoming cricket matches found.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Check back later for international and league fixtures.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {displayMatches.map((match, idx) => (
                            <Card
                                key={idx}
                                className="card-hover overflow-hidden border-l-4 border-l-emerald-600 animate-slide-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <CardHeader className="pb-3 bg-muted/20">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base font-semibold truncate pr-2">
                                            {match.league?.name || 'International Cricket'}
                                        </CardTitle>
                                        <Badge
                                            variant={match.commence_time?.toLowerCase().includes('live') ? 'destructive' : 'secondary'}
                                            className={match.commence_time?.toLowerCase().includes('live') ? 'animate-pulse' : ''}
                                        >
                                            {match.commence_time?.toLowerCase().includes('live') ? '🔴 LIVE' : match.commence_time || 'Scheduled'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <span className="font-medium text-lg">{match.home_team}</span>
                                            <span className="font-mono font-bold text-muted-foreground">vs</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <span className="font-medium text-lg">{match.away_team}</span>
                                        </div>
                                        {match.venue && (
                                            <div className="flex items-center text-xs text-muted-foreground mt-4 pt-3 border-t">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {match.venue}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="container mt-10">
                <div className="section-divider" />
            </div>
        </section>
    )
}
