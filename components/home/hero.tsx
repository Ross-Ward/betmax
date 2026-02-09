import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background py-12 md:py-20 lg:py-24">
            <div className="container relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Odds Updated Real-Time
                </div>
                <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Maximize Your <span className="text-primary">Winnings</span>
                </h1>
                <p className="mb-8 max-w-[600px] text-lg text-muted-foreground sm:text-xl">
                    Compare odds from top bookmakers, find sure bets, and track market movements in real-time.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                        <Link href="/sports/soccer">
                            Browse Sports <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/live">
                            <Trophy className="mr-2 h-4 w-4" /> Live Events
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"></div>
        </section>
    )
}
