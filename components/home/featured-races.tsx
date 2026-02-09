import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataIntelligence } from "@/lib/data/intelligence"
import { Clock, MapPin, PawPrint } from "lucide-react"
import Link from "next/link"

export async function FeaturedRaces() {
    // Fetch greyhound and horse racing data
    const [greyhoundData, horseData] = await Promise.allSettled([
        DataIntelligence.getSportsData('greyhound_races'),
        DataIntelligence.getSportsData('horse_racing_meetings')
    ])

    const greyhounds = greyhoundData.status === 'fulfilled' && Array.isArray(greyhoundData.value)
        ? greyhoundData.value.slice(0, 3)
        : []

    const horses = horseData.status === 'fulfilled' && Array.isArray(horseData.value)
        ? horseData.value.slice(0, 3)
        : []

    const allRaces = [
        ...greyhounds.map((race: any) => ({
            type: 'greyhound',
            venue: race.course || race.venue || 'Unknown Track',
            time: race.time || race.raceTime || 'TBA',
            runners: race.runners?.length || race.numberOfRunners || 0,
            distance: race.distance || 'N/A'
        })),
        ...horses.map((meeting: any) => ({
            type: 'horse',
            venue: meeting.course || meeting.venue || 'Unknown Course',
            time: meeting.firstRace || meeting.time || 'TBA',
            runners: meeting.races?.length || 0,
            distance: meeting.type || 'Flat'
        }))
    ].slice(0, 6)

    if (allRaces.length === 0) {
        return null
    }

    return (
        <section className="py-8 bg-muted/30">
            <div className="container">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Today's Racing</h2>
                    <Link href="/betting" className="text-sm text-primary hover:underline">
                        View All Racecards →
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allRaces.map((race, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base font-semibold">
                                        {race.venue}
                                    </CardTitle>
                                    <Badge variant={race.type === 'greyhound' ? 'secondary' : 'default'}>
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
                                    <Clock className="h-4 w-4 mr-2" />
                                    {race.time}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {race.distance} • {race.runners} runners
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
