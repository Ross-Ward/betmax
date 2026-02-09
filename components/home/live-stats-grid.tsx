import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataIntelligence } from "@/lib/data/intelligence"
import { Trophy, TrendingUp, Calendar, Activity, AlertCircle } from "lucide-react"
import { withTimeout, retryWithBackoff } from "@/lib/scrapers/scraper-utils"

async function fetchWithTimeout<T>(
    promise: Promise<T>,
    name: string,
    timeoutMs: number = 10000
): Promise<T | null> {
    try {
        return await withTimeout(
            retryWithBackoff(() => promise, 2, 1000),
            timeoutMs,
            `${name} timed out after ${timeoutMs}ms`
        )
    } catch (error) {
        console.error(`[LiveStatsGrid] Failed to fetch ${name}:`, error)
        return null
    }
}

export async function LiveStatsGrid() {
    // Fetch real data from all working scrapers with timeout protection
    const [plTable, f1Drivers, ufcEvents, nbaTable] = await Promise.allSettled([
        fetchWithTimeout(DataIntelligence.getSportsData('pl_table'), 'PL Table', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('f1_driver_standings'), 'F1 Drivers', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('ufc_events'), 'UFC Events', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('nba_table'), 'NBA Table', 10000)
    ])

    // Extract leader data with validation
    const plLeader = plTable.status === 'fulfilled' && plTable.value && Array.isArray(plTable.value) && plTable.value[0]
        ? plTable.value[0]
        : null

    const f1Leader = f1Drivers.status === 'fulfilled' && f1Drivers.value && Array.isArray(f1Drivers.value) && f1Drivers.value[0]
        ? f1Drivers.value[0]
        : null

    const nextUfcEvent = ufcEvents.status === 'fulfilled' && ufcEvents.value && Array.isArray(ufcEvents.value) && ufcEvents.value[0]
        ? ufcEvents.value[0]
        : null

    const nbaLeader = nbaTable.status === 'fulfilled' && nbaTable.value && Array.isArray(nbaTable.value) && nbaTable.value[0]
        ? nbaTable.value[0]
        : null

    const stats = [
        {
            title: "Premier League Leader",
            value: plLeader?.team || "Unavailable",
            subtitle: plLeader
                ? `${plLeader.points} pts • ${plLeader.played} played`
                : plTable.status === 'rejected'
                    ? "Failed to load data"
                    : "No data available",
            icon: plLeader ? Trophy : AlertCircle,
            color: plLeader ? "text-purple-500" : "text-muted-foreground",
            hasError: !plLeader
        },
        {
            title: "F1 Championship Leader",
            value: f1Leader?.driver || "Unavailable",
            subtitle: f1Leader
                ? `${f1Leader.points} pts • ${f1Leader.team}`
                : f1Drivers.status === 'rejected'
                    ? "Failed to load data"
                    : "No data available",
            icon: f1Leader ? TrendingUp : AlertCircle,
            color: f1Leader ? "text-red-500" : "text-muted-foreground",
            hasError: !f1Leader
        },
        {
            title: "Next UFC Event",
            value: nextUfcEvent?.name || "Unavailable",
            subtitle: nextUfcEvent?.date
                || (ufcEvents.status === 'rejected' ? "Failed to load data" : "No events scheduled"),
            icon: nextUfcEvent ? Calendar : AlertCircle,
            color: nextUfcEvent ? "text-orange-500" : "text-muted-foreground",
            hasError: !nextUfcEvent
        },
        {
            title: "NBA Eastern Leader",
            value: nbaLeader?.team || "Unavailable",
            subtitle: nbaLeader
                ? `${nbaLeader.wins}-${nbaLeader.losses}`
                : nbaTable.status === 'rejected'
                    ? "Failed to load data"
                    : "No data available",
            icon: nbaLeader ? Activity : AlertCircle,
            color: nbaLeader ? "text-blue-500" : "text-muted-foreground",
            hasError: !nbaLeader
        }
    ]

    return (
        <section className="py-8">
            <div className="container">
                <h2 className="mb-6 text-2xl font-bold tracking-tight">Live Sports Stats</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => (
                        <Card
                            key={idx}
                            className={`border-l-4 ${stat.hasError ? 'border-l-muted' : 'border-l-primary/50'}`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold truncate ${stat.hasError ? 'text-muted-foreground' : ''}`}>
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.subtitle}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

