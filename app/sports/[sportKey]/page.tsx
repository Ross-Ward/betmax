import { getEventsBySport } from "@/lib/api";
import { BettingDashboard } from "@/components/odds/betting-dashboard";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

interface SportPageProps {
    params: Promise<{
        sportKey: string;
    }>;
}

export default async function SportPage({ params }: SportPageProps) {
    // Await params as required in Next.js 15
    const { sportKey } = await params;

    // Fetch initial data for this specific sport
    const events = await getEventsBySport(sportKey);

    // If no events found and strictly checking, we might 404, 
    // but for now let's allow rendering an empty dashboard so the user sees *something* 
    // instead of a 404 error if they type a valid sport key that just happens to have no live games.

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tighter uppercase">{sportKey.replace(/_/g, ' ')}</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Live odds and markets for {sportKey}. Confirmed real feeds only.
                </p>
            </div>

            <Suspense fallback={<div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse font-mono text-xs">CONTACTING ODDS PROVIDER...</p>
            </div>}>
                <BettingDashboard initialEvents={events} initialSport={sportKey} />
            </Suspense>
        </div>
    );
}
