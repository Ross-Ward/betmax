import { StatsDashboard } from "@/components/data/stats-dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Stats Hub | BetMax Data Engine",
    description: "Browse curated sports datasets and internal stats.",
}

export default function StatsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 pt-6">
            <StatsDashboard />
        </div>
    )
}
