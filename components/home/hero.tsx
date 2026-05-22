import Link from "next/link"
import { ArrowRight, Trophy, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-32">
            <div className="container relative z-10 flex flex-col items-center text-center">
                {/* Live indicator badge */}
                <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 glass px-4 py-1.5 text-sm text-muted-foreground animate-slide-up">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="mr-2">Live Odds Updated Real-Time</span>
                    <Zap className="h-3 w-3 text-amber-400" />
                </div>

                {/* Main heading with gradient text */}
                <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up delay-100">
                    Maximize Your{" "}
                    <span className="gradient-text">Winnings</span>
                </h1>

                <p className="mb-10 max-w-[640px] text-lg text-muted-foreground sm:text-xl leading-relaxed animate-slide-up delay-200">
                    Compare odds from top bookmakers, find arbitrage opportunities, and stream live sports — all in one premium platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row animate-slide-up delay-300">
                    <Button size="lg" className="relative overflow-hidden group px-8" asChild>
                        <Link href="/live">
                            <span className="relative z-10 flex items-center">
                                Browse Sports <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="group px-8 border-primary/20 hover:border-primary/40" asChild>
                        <Link href="/live">
                            <Trophy className="mr-2 h-4 w-4 text-amber-500" /> Live Events
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="group px-8 border-primary/20 hover:border-primary/40" asChild>
                        <Link href="/arbitrage">
                            <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" /> Arbitrage
                        </Link>
                    </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-12 flex items-center gap-8 text-xs text-muted-foreground animate-slide-up delay-500">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        19+ Live Sources
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                        Real-Time Odds
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                        Multi-Sport Coverage
                    </div>
                </div>
            </div>

            {/* Background decorative orbs */}
            <div className="absolute top-1/2 left-1/2 -z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/10 via-primary/5 to-fuchsia-500/10 blur-[120px] animate-pulse-glow"></div>
            <div className="absolute top-1/4 right-1/4 -z-0 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-cyan-500/8 to-emerald-500/8 blur-[80px] animate-float-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 -z-0 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-amber-500/8 to-rose-500/8 blur-[80px] animate-float"></div>
        </section>
    )
}
