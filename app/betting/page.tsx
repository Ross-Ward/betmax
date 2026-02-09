import { getBettingEvents } from "@/lib/scrapers";
import { BettingDashboard } from "@/components/odds/betting-dashboard";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function BettingPage() {
    // Fetch initial betting data
    const events = await getBettingEvents();

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Sports Betting</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Compare odds across major bookmakers for all global sports events.
                </p>
            </div>

            <Suspense fallback={<div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Scraping latest odds from global markets...</p>
            </div>}>
                <BettingDashboard initialEvents={events} />
            </Suspense>
        </div>
    );
}
