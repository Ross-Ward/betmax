import { getFeaturedEvents } from "@/lib/api"
import { OddsTable } from "@/components/odds/odds-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export async function UpcomingMatches() {
    const events = await getFeaturedEvents()

    return (
        <section className="py-12 bg-muted/30">
            <div className="container">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Upcoming Matches</h2>
                    <Button variant="ghost" asChild>
                        <Link href="/sports/soccer">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <OddsTable events={events} limit={5} />
            </div>
        </section>
    )
}
