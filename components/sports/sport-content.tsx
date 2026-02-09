"use client"

import { useState } from "react"
import { Event } from "@/lib/types"
import { OddsTable } from "@/components/odds/odds-table"
import { StreamsTab } from "@/components/streams/streams-tab"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SportContentProps {
    events: Event[]
    sportTitle: string
}

type Tab = 'odds' | 'streams' | 'schedule'

export function SportContent({ events, sportTitle }: SportContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('odds')

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-1 rounded-lg border bg-muted p-1 w-fit">
                <Button
                    variant={activeTab === 'odds' ? 'secondary' : 'ghost'} // Helper variant logic or just custom class
                    size="sm"
                    onClick={() => setActiveTab('odds')}
                    className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium transition-all",
                        activeTab === 'odds'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    Results & Odds
                </Button>
                {/* Streams Tab Removed as per user request - only on /live */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('schedule')}
                    className={cn(
                        "rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
                        activeTab === 'schedule' && "border-primary text-foreground"
                    )}
                >
                    Schedule
                </Button>
            </div>

            <div className="rounded-lg border bg-card animate-in fade-in-50 duration-300">
                <div className="p-6">
                    {activeTab === 'odds' && (
                        <>
                            <h2 className="mb-4 text-xl font-semibold">Upcoming Matches</h2>
                            <OddsTable events={events} />
                        </>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="text-center py-12 text-muted-foreground">
                            Schedule view coming soon...
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
