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

// Loading skeleton component
function SectionSkeleton() {
  return (
    <section className="py-8 animate-pulse">
      <div className="container">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
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
    <div className="flex flex-col min-h-screen">
      {/* Hero loads immediately - no data fetching */}
      <Hero />

      {/* Stats section with error boundary and suspense */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <LiveStatsGrid />
        </Suspense>
      </ErrorBoundary>

      {/* Popular sports - static content, loads immediately */}
      <PopularSports />

      {/* Soccer highlights with error boundary */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SoccerHighlights />
        </Suspense>
      </ErrorBoundary>

      {/* Featured races with error boundary */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedRaces />
        </Suspense>
      </ErrorBoundary>

      {/* Cricket highlights with error boundary */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <CricketHighlights />
        </Suspense>
      </ErrorBoundary>

      {/* Upcoming matches with error boundary */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <UpcomingMatches />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
