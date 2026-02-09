import { getEventById } from "@/lib/api"
import { EventHeader } from "@/components/events/event-header"
import { MarketComparison } from "@/components/events/market-comparison"
import { EventIntelPanel } from "@/components/events/event-intel-panel"
import { notFound } from "next/navigation"

interface EventPageProps {
    params: Promise<{
        eventId: string
    }>
}

export default async function EventPage({ params }: EventPageProps) {
    const { eventId } = await params
    const event = await getEventById(eventId)

    if (!event) {
        notFound()
    }

    return (
        <div className="container py-6 space-y-6">
            <EventHeader event={event} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <MarketComparison event={event} />
                </div>
                <div className="lg:col-span-1">
                    <EventIntelPanel
                        eventName={`${event.home_team} vs ${event.away_team}`}
                        sportTitle={event.sport_title}
                    />
                </div>
            </div>
        </div>
    )
}
