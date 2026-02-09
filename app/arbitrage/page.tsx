"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArbitrageOpportunity } from "@/lib/scraper-types"
import { Loader2, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react"

export default function ArbitragePage() {
    const [loading, setLoading] = useState(false)
    const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
    const [status, setStatus] = useState("Ready to scan")

    const runScrape = async (source: 'oddsportal' | 'oddspedia') => {
        setLoading(true)
        setStatus(source === 'oddspedia' ? "Launching Browser... Please solve CAPTCHA manually." : "Scanning Oddsportal...")

        try {
            const res = await fetch(`/api/scrape?source=${source}`)
            const json = await res.json()

            if (json.success) {
                setOpportunities(json.data)
                setStatus(`Found ${json.count} opportunities`)
            } else {
                setStatus("Scan failed")
            }
        } catch (e) {
            setStatus("Error connecting to scraper")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Arbitrage Scanner</h1>
                    <p className="text-muted-foreground">Find sure bets across multiple bookmakers.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => runScrape('oddsportal')}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Scan Oddsportal (Auto)
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => runScrape('oddspedia')}
                        disabled={loading}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Scan Oddspedia (Interactive)
                    </Button>
                </div>
            </div>

            <Card className="p-4 bg-muted/50 border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Status: <span className="font-medium text-foreground">{status}</span></span>
                </div>
            </Card>

            <div className="grid gap-4">
                {opportunities.map((opp) => (
                    <Card key={opp.id} className="p-6 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-muted-foreground">{opp.sport} • {opp.time}</span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">{opp.source}</span>
                                </div>
                                <h3 className="text-lg font-semibold">{opp.event}</h3>
                                <p className="text-sm text-muted-foreground">{opp.market}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{opp.profit_percentage.toFixed(2)}%</div>
                                <span className="text-xs text-muted-foreground">Profit</span>
                            </div>
                        </div>
                    </Card>
                ))}

                {!loading && opportunities.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No opportunities found. Try running a scan.
                    </div>
                )}
            </div>
        </div>
    )
}
