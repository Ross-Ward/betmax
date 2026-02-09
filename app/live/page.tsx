import { getAggregatedEvents } from "@/lib/scrapers";
import { LiveDashboard } from "@/components/live/live-dashboard";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'; // Disable caching for real-time data

export default async function LivePage() {
    // Fetch real events from multiple sources
    const events = await getAggregatedEvents();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Live Events</h1>
                <p className="text-muted-foreground">
                    Real-time match schedule and streams scraped from Totalsportek.
                </p>
            </div>

            <Suspense fallback={<div className="text-center py-10">Loading live events...</div>}>
                <LiveDashboard events={events} />
            </Suspense>
        </div>
    );
}
