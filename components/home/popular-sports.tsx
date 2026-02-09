import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Activity, Target, Flame, PawPrint, Zap, Flag, Users } from "lucide-react"

const POPULAR_SPORTS = [
    {
        title: "Premier League",
        icon: Trophy,
        href: "/sports/soccer",
        count: "Table & Fixtures",
        color: "text-purple-500",
    },
    {
        title: "Formula 1",
        icon: Flag,
        href: "/sports/f1",
        count: "Driver Standings",
        color: "text-red-500",
    },
    {
        title: "UFC / MMA",
        icon: Flame,
        href: "/sports/ufc",
        count: "Rankings & Events",
        color: "text-orange-500",
    },
    {
        title: "NBA",
        icon: Activity,
        href: "/sports/basketball",
        count: "Live Standings",
        color: "text-blue-500",
    },
    {
        title: "Horse Racing",
        icon: Target,
        href: "/sports/horse",
        count: "Today's Meetings",
        color: "text-amber-600",
    },
    {
        title: "Greyhounds",
        icon: PawPrint,
        href: "/sports/greyhounds",
        count: "Live Racecards",
        color: "text-stone-500",
    },
    {
        title: "Cricket",
        icon: Zap,
        href: "/sports/cricket",
        count: "Live Matches",
        color: "text-green-500",
    },
    {
        title: "PGA Golf",
        icon: Users,
        href: "/sports/golf",
        count: "Leaderboards",
        color: "text-teal-500",
    },
]

export function PopularSports() {
    return (
        <section className="py-12">
            <div className="container">
                <h2 className="mb-8 text-2xl font-bold tracking-tight">All Sports Coverage</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {POPULAR_SPORTS.map((sport) => (
                        <Link key={sport.title} href={sport.href}>
                            <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className={`mb-4 rounded-full bg-muted p-4 ${sport.color}`}>
                                        <sport.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-semibold">{sport.title}</h3>
                                    <p className="text-sm text-muted-foreground">{sport.count}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
