"use client"

import { Event } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseEventTime } from "@/lib/time-utils"

interface EventCardProps {
    event: Event
    onClick: () => void
    isExpanded: boolean
    isFavorite?: boolean
    onToggleFavorite?: (e: React.MouseEvent) => void
}

export function EventCard({ event, onClick, isExpanded, isFavorite, onToggleFavorite }: EventCardProps) {
    const { display: displayTime, isLive: live, isEnded } = parseEventTime(event.commence_time);

    return (
        <div
            onClick={!isEnded ? onClick : undefined}
            className={cn(
                "group relative bg-[#1e2736] border border-white/5 rounded-2xl p-4 transition-all duration-300 shadow-lg",
                isEnded ? "opacity-50 cursor-not-allowed grayscale" : "hover:bg-[#252f40] cursor-pointer",
                isExpanded && "ring-2 ring-primary/40 bg-[#252f40]"
            )}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                    {/* League Info Row */}
                    {event.league?.logo && (
                        <div className="flex items-center gap-2 mb-1">
                            <img src={event.league.logo} alt="" className="w-3.5 h-3.5 object-contain opacity-70" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{event.league.name}</span>
                        </div>
                    )}

                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-primary/30 transition-colors">
                                {event.images?.[0] ? (
                                    <img src={event.images[0]} alt="" className="w-6 h-6 object-contain" />
                                ) : event.league?.logo ? (
                                    <img src={event.league.logo} alt="" className="w-4 h-4 object-contain opacity-30 grayscale group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <span className="text-xs font-bold text-zinc-600 group-hover:text-primary/60">{event.home_team.substring(0, 1)}</span>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                {event.home_team}
                            </span>
                        </div>
                        <Star
                            className={cn(
                                "h-4 w-4 transition-colors cursor-pointer",
                                isFavorite ? "text-yellow-500 fill-yellow-500" : "text-zinc-600 hover:text-yellow-500"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite?.(e);
                            }}
                        />
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-primary/30 transition-colors">
                                {event.images?.[1] ? (
                                    <img src={event.images[1]} alt="" className="w-6 h-6 object-contain" />
                                ) : event.league?.logo ? (
                                    <img src={event.league.logo} alt="" className="w-4 h-4 object-contain opacity-30 grayscale group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <span className="text-xs font-bold text-zinc-600 group-hover:text-primary/60">{event.away_team.substring(0, 1)}</span>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                {event.away_team}
                            </span>
                        </div>
                        <Star
                            className={cn(
                                "h-4 w-4 transition-colors cursor-pointer",
                                isFavorite ? "text-yellow-500 fill-yellow-500" : "text-zinc-600 hover:text-yellow-500"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite?.(e);
                            }}
                        />
                    </div>
                </div>

                {/* Status / Time */}
                <div className="flex flex-col items-center justify-center min-w-[80px] border-l border-white/5 pl-4 ml-2 gap-1">
                    {live ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mb-1" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
                                {displayTime.includes('Tmrw') ? 'Tomorrow' : displayTime.includes(',') ? displayTime.split(',')[0] : 'Today'}
                            </div>
                            <div className="text-sm font-bold text-zinc-300">
                                {displayTime.replace('Tmrw ', '').split(',').pop()?.trim()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
        </div>
    )
}
