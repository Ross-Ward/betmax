import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataIntelligence } from "@/lib/data/intelligence"
import { Clock, MapPin, PawPrint, Target } from "lucide-react"
import Link from "next/link"

export async function FeaturedRaces() {
    const [greyhoundData, horseData] = await Promise.allSettled([
        DataIntelligence.getSportsData('greyhound_races'),
        DataIntelligence.getSportsData('horse_racing_meetings')
    ])

    const greyhounds = greyhoundData.status === 'fulfilled' && Array.isArray(greyhoundData.value)
        ? greyhoundData.value.slice(0, 3) : []

    const horses = horseData.status === 'fulfilled' && Array.isArray(horseData.value)
        ? horseData.value.slice(0, 3) : []

    const allRaces = [
        ...greyhounds.map((race: any) => ({
            type: 'greyhound' as const,
            venue: race.course || race.venue || 'Unknown Track',
            time: race.time || race.raceTime || 'TBA',
            runners: race.runners?.length || race.numberOfRunners || 0,
            distance: race.distance || 'N/A'
        })),
        ...horses.map((meeting: any) => ({
            type: 'horse' as const,
            venue: meeting.course || meeting.venue || 'Unknown Course',
            time: meeting.firstRace || meeting.time || 'TBA',
            runners: meeting.races?.length || 0,
            distance: meeting.type || 'Flat'
        }))
    ].slice(0, 6)

    return (
        <section className="py-10 bg-muted/20">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white">
                            <Target className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Today&apos;s Racing</h2>
                    </div>
                    <Link href="/betting" className="text-sm text-primary hover:underline font-medium">
                        View All Racecards →
                    </Link>
                </div>

                {allRaces.length === 0 ? (
                    <Card className="border-dashed border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Target className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No races scheduled at the moment.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Racecards usually update in the early morning.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {allRaces.map((race, idx) => (
                            <Card
                                key={idx}
                                className={`card-hover overflow-hidden animate-slide-up ${race.type === 'greyhound' ? 'border-l-4 border-l-stone-500' : 'border-l-4 border-l-amber-600'}`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base font-semibold">
                                            {race.venue}
                                        </CardTitle>
                                        <Badge
                                            variant={race.type === 'greyhound' ? 'secondary' : 'default'}
                                            className="text-xs"
                                        >
                                            {race.type === 'greyhound' ? (
                                                <><PawPrint className="h-3 w-3 mr-1" /> Dogs</>
                                            ) : (
                                                <>🐎 Horses</>
                                            )}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                        {race.time}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                        {race.distance} • {race.runners} runners
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
