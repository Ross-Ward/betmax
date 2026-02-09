import { Event } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

interface EventHeaderProps {
    event: Event
}

export function EventHeader({ event }: EventHeaderProps) {
    const eventDate = new Date(event.commence_time)

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{event.sport_title}</span>
                    <span>•</span>
                    <span>{event.league.name}</span>
                </div>
                <Badge variant={eventDate < new Date() ? "destructive" : "secondary"}>
                    {eventDate < new Date() ? "Live" : "Upcoming"}
                </Badge>
            </div>

            <div className="flex flex-col items-center justify-between gap-8 py-6 md:flex-row md:px-12">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold md:text-3xl">{event.home_team}</h2>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl font-bold text-muted-foreground">VS</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{eventDate.toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="text-center md:text-right">
                    <h2 className="text-2xl font-bold md:text-3xl">{event.away_team}</h2>
                </div>
            </div>
        </div>
    )
}
