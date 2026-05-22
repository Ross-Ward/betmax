import { Suspense } from "react"
import { Hero } from "@/components/home/hero"
import { PopularSports } from "@/components/home/popular-sports"
import { UpcomingMatches } from "@/components/home/upcoming-matches"
import { LiveStatsGrid } from "@/components/home/live-stats-grid"
import { SoccerHighlights } from "@/components/home/soccer-highlights"
import { FeaturedRaces } from "@/components/home/featured-races"
import { CricketHighlights } from "@/components/home/cricket-highlights"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function SectionSkeleton() {
  return (
    <section className="py-12 animate-pulse">
      <div className="container">
        <div className="h-8 w-48 bg-muted rounded mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32">
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative selection:bg-primary/20">
      {/* Subtle background noise/pattern */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <Hero />

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <LiveStatsGrid />
        </Suspense>
      </ErrorBoundary>

      <PopularSports />

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SoccerHighlights />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedRaces />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <CricketHighlights />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <UpcomingMatches />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
