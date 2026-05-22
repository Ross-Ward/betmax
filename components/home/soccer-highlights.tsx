import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSoccerData } from "@/lib/scrapers"
import { Calendar, TrendingUp, Trophy } from "lucide-react"
import { CompetitionTable, DataEvent } from "@/lib/types/data-schema"
import Link from "next/link"

export async function SoccerHighlights() {
    let soccerData: { tables: CompetitionTable[], events: DataEvent[] } | null = null
    try {
        soccerData = await getSoccerData()
    } catch (error) {
        console.error('[SoccerHighlights] Error fetching data:', error)
    }

    const table = soccerData?.tables?.[0]?.entries || []
    const fixtures = soccerData?.events || []

    const topTeams = table.slice(0, 5)
    const upcomingMatches = fixtures
        .filter((f) => f.status?.toLowerCase().includes('upcoming') || f.status?.toLowerCase().includes('scheduled'))
        .slice(0, 3)

    const hasData = topTeams.length > 0 || upcomingMatches.length > 0

    return (
        <section className="py-10">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-2 text-white">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Premier League</h2>
                    </div>
                    <Link href="/sports/soccer" className="text-sm text-primary hover:underline font-medium">
                        Full Table & Fixtures →
                    </Link>
                </div>

                {!hasData ? (
                    <Card className="border-dashed border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Trophy className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">Premier League data is loading or currently unavailable.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Check back soon for live standings and fixtures.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Top 5 Table */}
                        <Card className="card-hover">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4 text-purple-500" />
                                    Top 5 Standings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {topTeams.map((team: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${idx % 2 === 0 ? 'bg-muted/40' : ''} hover:bg-muted/60`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : idx < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="font-medium">{team.participant_name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{team.played} GP</span>
                                                <span className="font-bold text-foreground min-w-[45px] text-right">{team.points} pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Fixtures */}
                        <Card className="card-hover">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Upcoming Fixtures
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingMatches.length > 0 ? (
                                        upcomingMatches.map((match, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 hover:border-primary/20 transition-colors">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {match.name || `${match.participants[0]?.name} vs ${match.participants[1]?.name}`}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {match.start_time || 'Date TBA'}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">{match.status || 'Scheduled'}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center py-6 text-center">
                                            <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                            <p className="text-sm text-muted-foreground">No upcoming fixtures available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Section divider */}
            <div className="container mt-10">
                <div className="section-divider" />
            </div>
        </section>
    )
}
