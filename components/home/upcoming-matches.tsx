import { getFeaturedEvents } from "@/lib/api"
import { OddsTable } from "@/components/odds/odds-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export async function UpcomingMatches() {
    let events: any[] = []
    try {
        events = await getFeaturedEvents()
    } catch (error) {
        console.error('[UpcomingMatches] Failed to fetch events:', error)
    }

    return (
        <section className="py-16 bg-muted/30">
            <div className="container">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-2 text-white shadow-lg shadow-blue-500/20">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Upcoming Matches</h2>
                    </div>
                    <Button variant="ghost" className="group" asChild>
                        <Link href="/sports/soccer">
                            View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                {events.length > 0 ? (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-slide-up">
                        <OddsTable events={events} limit={5} />
                    </div>
                ) : (
                    <Card className="border-dashed border-muted-foreground/20 bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No matches found</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-[400px]">
                                We couldn&apos;t find any upcoming featured matches at the moment.
                                Check back later or browse specific sports below.
                            </p>
                            <Button variant="outline" className="mt-6" asChild>
                                <Link href="/sports/soccer">Browse Soccer</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    )
}
