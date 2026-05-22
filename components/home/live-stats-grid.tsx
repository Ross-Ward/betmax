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

const SPORT_COLORS = {
    purple: { gradient: "from-purple-500/20 to-purple-600/5", border: "border-l-purple-500", iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
    red: { gradient: "from-red-500/20 to-red-600/5", border: "border-l-red-500", iconBg: "bg-red-500/10", iconColor: "text-red-500" },
    orange: { gradient: "from-orange-500/20 to-orange-600/5", border: "border-l-orange-500", iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    blue: { gradient: "from-blue-500/20 to-blue-600/5", border: "border-l-blue-500", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    muted: { gradient: "from-muted/50 to-muted/20", border: "border-l-muted-foreground/30", iconBg: "bg-muted", iconColor: "text-muted-foreground" },
}

export async function LiveStatsGrid() {
    const [plTable, f1Drivers, ufcEvents, nbaTable] = await Promise.allSettled([
        fetchWithTimeout(DataIntelligence.getSportsData('pl_table'), 'PL Table', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('f1_driver_standings'), 'F1 Drivers', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('ufc_events'), 'UFC Events', 10000),
        fetchWithTimeout(DataIntelligence.getSportsData('nba_table'), 'NBA Table', 10000)
    ])

    const plLeader = plTable.status === 'fulfilled' && plTable.value && Array.isArray(plTable.value) && plTable.value[0]
        ? plTable.value[0] : null
    const f1Leader = f1Drivers.status === 'fulfilled' && f1Drivers.value && Array.isArray(f1Drivers.value) && f1Drivers.value[0]
        ? f1Drivers.value[0] : null
    const nextUfcEvent = ufcEvents.status === 'fulfilled' && ufcEvents.value && Array.isArray(ufcEvents.value) && ufcEvents.value[0]
        ? ufcEvents.value[0] : null
    const nbaLeader = nbaTable.status === 'fulfilled' && nbaTable.value && Array.isArray(nbaTable.value) && nbaTable.value[0]
        ? nbaTable.value[0] : null

    const stats = [
        {
            title: "Premier League Leader",
            value: plLeader?.team || "Awaiting Data",
            subtitle: plLeader
                ? `${plLeader.points} pts • ${plLeader.played} played`
                : "Data will appear when available",
            icon: plLeader ? Trophy : AlertCircle,
            colorKey: plLeader ? 'purple' as const : 'muted' as const,
        },
        {
            title: "F1 Championship Leader",
            value: f1Leader?.driver || "Awaiting Data",
            subtitle: f1Leader
                ? `${f1Leader.points} pts • ${f1Leader.team}`
                : "Data will appear when available",
            icon: f1Leader ? TrendingUp : AlertCircle,
            colorKey: f1Leader ? 'red' as const : 'muted' as const,
        },
        {
            title: "Next UFC Event",
            value: nextUfcEvent?.name || "Awaiting Data",
            subtitle: nextUfcEvent?.date || "No events scheduled yet",
            icon: nextUfcEvent ? Calendar : AlertCircle,
            colorKey: nextUfcEvent ? 'orange' as const : 'muted' as const,
        },
        {
            title: "NBA Eastern Leader",
            value: nbaLeader?.team || "Awaiting Data",
            subtitle: nbaLeader
                ? `${nbaLeader.wins}-${nbaLeader.losses}`
                : "Data will appear when available",
            icon: nbaLeader ? Activity : AlertCircle,
            colorKey: nbaLeader ? 'blue' as const : 'muted' as const,
        }
    ]

    return (
        <section className="py-10">
            <div className="container">
                <div className="mb-6 flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">Live Sports Stats</h2>
                    <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => {
                        const colors = SPORT_COLORS[stat.colorKey]
                        return (
                            <Card
                                key={idx}
                                className={`border-l-4 ${colors.border} card-hover overflow-hidden relative animate-slide-up`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Subtle gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none`} />
                                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
                                        <stat.icon className={`h-4 w-4 ${colors.iconColor}`} />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className={`text-2xl font-bold truncate ${stat.colorKey === 'muted' ? 'text-muted-foreground' : ''}`}>
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.subtitle}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
