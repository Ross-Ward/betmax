"use client"

import { useState, useMemo } from "react"
import { Event, StreamLink } from "@/lib/types"
import { StreamList } from "./stream-list"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Tv, Trophy, Swords, Activity, Target, Flame, PlayCircle, Globe, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StreamsTabProps {
    events: Event[]
    sportTitle: string
    onWatch?: (stream: StreamLink, all: StreamLink[]) => void
    favorites: string[]
    onToggleFavorite: (eventId: string) => void
}

import { EventCard } from "./event-card"

export function StreamsTab({ events, sportTitle, onWatch, favorites, onToggleFavorite }: StreamsTabProps) {
    const [expandedEvents, setExpandedEvents] = useState<string[]>([])
    const [fetchedStreams, setFetchedStreams] = useState<Record<string, StreamLink[]>>({})
    const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({})

    const toggleEvent = async (event: Event) => {
        const isExpanded = expandedEvents.includes(event.id)

        if (isExpanded) {
            setExpandedEvents(prev => prev.filter(id => id !== event.id))
        } else {
            // Close others when opening one to keep grid clean, or allow mult?
            // User likely wants mult for comparison, but keep it simple
            setExpandedEvents([event.id])

            if ((!event.streams || event.streams.length === 0) && event.url && !fetchedStreams[event.id]) {
                setLoadingStreams(prev => ({ ...prev, [event.id]: true }))
                try {
                    const res = await fetch(`/api/streams?url=${encodeURIComponent(event.url)}`)
                    const data = await res.json()
                    if (data.streams) {
                        setFetchedStreams(prev => ({ ...prev, [event.id]: data.streams }))
                    }
                } catch (e) {
                    console.error("Failed to fetch streams", e)
                } finally {
                    setLoadingStreams(prev => ({ ...prev, [event.id]: false }))
                }
            }
        }
    }

    const groupedEvents = useMemo(() => {
        const groups: Record<string, Event[]> = {}
        events.forEach(event => {
            const leagueName = typeof event.league === 'string'
                ? event.league
                : event.league?.name || event.sport_title || "Other"
            if (!groups[leagueName]) groups[leagueName] = []
            groups[leagueName].push(event)
        })
        return groups
    }, [events])

    return (
        <div className="space-y-12">
            {Object.entries(groupedEvents).map(([leagueName, leagueEvents]) => (
                <div key={leagueName} className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                            {leagueName}
                            <span className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                {leagueEvents.length}
                            </span>
                        </h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leagueEvents.map((event) => {
                            const isExpanded = expandedEvents.includes(event.id)
                            const currentStreams = fetchedStreams[event.id] || event.streams || []
                            const isLoading = loadingStreams[event.id]
                            const streamCount = currentStreams.length
                            const isFav = favorites.includes(event.id)

                            return (
                                <div key={event.id} className="space-y-4">
                                    <EventCard
                                        event={event}
                                        onClick={() => toggleEvent(event)}
                                        isExpanded={isExpanded}
                                        isFavorite={isFav}
                                        onToggleFavorite={() => onToggleFavorite(event.id)}
                                    />

                                    {isExpanded && (
                                        <div className="bg-[#1a212d]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl relative overflow-hidden">
                                            {/* Subtle background glow when expanded */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/5 blur-[80px] pointer-events-none" />

                                            {isLoading ? (
                                                <div className="flex flex-col items-center justify-center py-10 gap-3 relative z-10">
                                                    <div className="relative">
                                                        <div className="h-10 w-10 rounded-full border-2 border-primary/20" />
                                                        <div className="absolute inset-0 h-10 w-10 rounded-full border-t-2 border-primary animate-spin" />
                                                    </div>
                                                    <span className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Scanning Links...</span>
                                                </div>
                                            ) : streamCount > 0 ? (
                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex items-center justify-between px-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Streams Found</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-none font-black uppercase tracking-tighter">
                                                            {streamCount} Sources
                                                        </Badge>
                                                    </div>
                                                    <StreamList
                                                        streams={currentStreams}
                                                        onWatch={onWatch}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-3 relative z-10">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-800/30 flex items-center justify-center border border-white/5">
                                                        <Tv className="h-6 w-6 opacity-20" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No Streams Found</p>
                                                        <p className="text-[10px] text-zinc-600 mt-1">Links usually appear 30m before kickoff</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {Object.keys(groupedEvents).length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-[#161d27] rounded-[32px] border border-dashed border-white/10">
                    <div className="p-6 rounded-full bg-zinc-800/50 mb-6">
                        <Tv className="h-12 w-12 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">No Live Matches Found</h3>
                    <p className="text-zinc-500 text-sm max-w-md text-center">
                        There are currently no live streams available for this category. Check back during game time!
                    </p>
                </div>
            )}
        </div>
    )
}

