"use client"

import { useState } from "react"
import { Event } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MarketComparisonProps {
    event: Event
}

export function MarketComparison({ event }: MarketComparisonProps) {
    const [selectedMarket, setSelectedMarket] = useState("h2h")

    // Get unique markets available across bookmakers
    const availableMarkets = Array.from(
        new Set(event.bookmakers.flatMap(b => b.markets.map(m => m.key)))
    )

    const marketNames: Record<string, string> = {
        h2h: "Match Winner (1X2)",
        spreads: "Asian Handicap",
        totals: "Over/Under",
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Odds Comparison</h3>
                <div className="w-[200px]">
                    <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Market" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMarkets.map(market => (
                                <SelectItem key={market} value={market}>
                                    {marketNames[market] || market}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                        {marketNames[selectedMarket] || selectedMarket}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Bookmaker</TableHead>
                                {/* Dynamic headers based on outcomes of the first bookmaker for this market */}
                                {event.bookmakers[0]?.markets.find(m => m.key === selectedMarket)?.outcomes.map((outcome, i) => (
                                    <TableHead key={i} className="text-center">{outcome.name} {outcome.point && `(${outcome.point})`}</TableHead>
                                ))}
                                <TableHead className="text-right">Payout</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {event.bookmakers.map((bookmaker) => {
                                const market = bookmaker.markets.find(m => m.key === selectedMarket)
                                if (!market) return null

                                // Calculate payout (simplified)
                                const impliedProb = market.outcomes.reduce((acc, o) => acc + (1 / o.price), 0)
                                const payout = (1 / impliedProb) * 100

                                return (
                                    <TableRow key={bookmaker.key}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {/* Placeholder for logo */}
                                                <div className="h-6 w-6 rounded bg-muted"></div>
                                                {bookmaker.title}
                                            </div>
                                        </TableCell>
                                        {market.outcomes.map((outcome, i) => (
                                            <TableCell key={i} className="text-center">
                                                <div className="inline-flex flex-col items-center justify-center rounded-md border bg-muted/30 px-3 py-1 font-bold transition-colors hover:bg-primary/10 hover:text-primary">
                                                    {outcome.price.toFixed(2)}
                                                </div>
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right text-muted-foreground">
                                            {payout.toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
