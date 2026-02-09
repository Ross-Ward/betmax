import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCricketEvents } from "@/lib/scrapers"
import { Activity } from "lucide-react"
import { Event } from "@/lib/types"

export async function CricketHighlights() {
    let events: Event[] = []
    try {
        events = await getCricketEvents()
    } catch (error) {
        console.error('[CricketHighlights] Error fetching data:', error)
        return null
    }

    const liveMatches = events.filter((e) =>
        e.commence_time?.toLowerCase().includes('live')
    ).slice(0, 3)

    const upcomingMatches = events.filter((e) =>
        e.commence_time?.toLowerCase().includes('upcoming') ||
        e.commence_time?.toLowerCase().includes('scheduled')
    ).slice(0, 3)

    const displayMatches = [...liveMatches, ...upcomingMatches].slice(0, 4)

    if (displayMatches.length === 0) {
        return null
    }

    return (
        <section className="py-8 bg-muted/30">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Cricket Matches
                    </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {displayMatches.map((match, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base font-semibold">
                                        {match.league?.name || 'International Cricket'}
                                    </CardTitle>
                                    <Badge variant={match.commence_time?.toLowerCase().includes('live') ? 'destructive' : 'secondary'}>
                                        {match.commence_time?.toLowerCase().includes('live') ? '🔴 LIVE' : match.commence_time || 'Scheduled'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{match.home_team}</span>
                                        <span className="font-bold">-</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{match.away_team}</span>
                                        <span className="font-bold">-</span>
                                    </div>
                                    {match.venue && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            📍 {match.venue}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
