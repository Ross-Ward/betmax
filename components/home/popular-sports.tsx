import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Activity, Target, Flame, PawPrint, Zap, Flag, Users, ArrowRight } from "lucide-react"

const POPULAR_SPORTS = [
    {
        title: "Premier League",
        icon: Trophy,
        href: "/sports/soccer",
        count: "Table & Fixtures",
        gradient: "from-purple-500 to-indigo-600",
        hoverBorder: "hover:border-purple-500/50",
    },
    {
        title: "Formula 1",
        icon: Flag,
        href: "/sports/f1",
        count: "Driver Standings",
        gradient: "from-red-500 to-rose-600",
        hoverBorder: "hover:border-red-500/50",
    },
    {
        title: "UFC / MMA",
        icon: Flame,
        href: "/sports/ufc",
        count: "Rankings & Events",
        gradient: "from-orange-500 to-amber-600",
        hoverBorder: "hover:border-orange-500/50",
    },
    {
        title: "NBA",
        icon: Activity,
        href: "/sports/basketball",
        count: "Live Standings",
        gradient: "from-blue-500 to-cyan-600",
        hoverBorder: "hover:border-blue-500/50",
    },
    {
        title: "Horse Racing",
        icon: Target,
        href: "/sports/horse",
        count: "Today's Meetings",
        gradient: "from-amber-600 to-yellow-600",
        hoverBorder: "hover:border-amber-600/50",
    },
    {
        title: "Greyhounds",
        icon: PawPrint,
        href: "/sports/greyhounds",
        count: "Live Racecards",
        gradient: "from-stone-500 to-stone-600",
        hoverBorder: "hover:border-stone-500/50",
    },
    {
        title: "Cricket",
        icon: Zap,
        href: "/sports/cricket",
        count: "Live Matches",
        gradient: "from-emerald-500 to-green-600",
        hoverBorder: "hover:border-emerald-500/50",
    },
    {
        title: "PGA Golf",
        icon: Users,
        href: "/sports/golf",
        count: "Leaderboards",
        gradient: "from-teal-500 to-cyan-600",
        hoverBorder: "hover:border-teal-500/50",
    },
]

export function PopularSports() {
    return (
        <section className="py-12">
            <div className="container">
                <h2 className="mb-8 text-2xl font-bold tracking-tight">All Sports Coverage</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {POPULAR_SPORTS.map((sport, idx) => (
                        <Link key={sport.title} href={sport.href}>
                            <Card
                                className={`h-full card-hover border-transparent ${sport.hoverBorder} transition-all duration-300 group animate-slide-up`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className={`mb-4 rounded-2xl bg-gradient-to-br ${sport.gradient} p-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <sport.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="font-semibold text-base">{sport.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{sport.count}</p>
                                    <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Explore <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
