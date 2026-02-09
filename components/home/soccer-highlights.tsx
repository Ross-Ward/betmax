import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSoccerData } from "@/lib/scrapers"
import { Calendar, TrendingUp } from "lucide-react"
import { CompetitionTable, DataEvent } from "@/lib/types/data-schema"
import Link from "next/link"

export async function SoccerHighlights() {
    let soccerData: { tables: CompetitionTable[], events: DataEvent[] } | null = null
    try {
        soccerData = await getSoccerData()
    } catch (error) {
        console.error('[SoccerHighlights] Error fetching data:', error)
        return null
    }

    const table = soccerData?.tables?.[0]?.entries || []
    const fixtures = soccerData?.events || []

    const topTeams = table.slice(0, 5)
    const upcomingMatches = fixtures
        .filter((f) => f.status?.toLowerCase().includes('upcoming') || f.status?.toLowerCase().includes('scheduled'))
        .slice(0, 3)

    return (
        <section className="py-8">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Premier League</h2>
                    <Link href="/sports/soccer" className="text-sm text-primary hover:underline">
                        Full Table & Fixtures →
                    </Link>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top 5 Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Top 5 Standings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topTeams.map((team: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium">{team.participant_name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{team.played} played</span>
                                            <span className="font-bold text-foreground">{team.points} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Fixtures */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Fixtures
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingMatches.length > 0 ? (
                                    upcomingMatches.map((match, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {match.name || `${match.participants[0]?.name} vs ${match.participants[1]?.name}`}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {match.start_time || 'Date TBA'}
                                                </div>
                                            </div>
                                            <Badge variant="outline">{match.status || 'Scheduled'}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No upcoming fixtures available
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
