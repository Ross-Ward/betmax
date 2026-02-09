import { StreamLink } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Tv,
    Smartphone,
    CheckCircle2,
    Activity,
    PlayCircle,
    Zap,
    ShieldCheck,
    Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StreamListProps {
    streams: StreamLink[]
    onWatch?: (stream: StreamLink, all: StreamLink[]) => void
}

export function StreamList({ streams, onWatch }: StreamListProps) {
    const [resolvingId, setResolvingId] = useState<string | null>(null)

    const handleWatch = async (stream: StreamLink, streamId: string) => {
        setResolvingId(streamId)
        try {
            const res = await fetch('/api/resolve-stream', {
                method: 'POST',
                body: JSON.stringify({ url: stream.url }),
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()

            const resolvedStream = {
                ...stream,
                url: data.url || stream.url,
                referer: data.referer || stream.url // Fallback to original if no new referer
            }
            if (onWatch) {
                onWatch(resolvedStream, streams)
            }
        } catch (e) {
            console.error("Resolve failed", e)
            if (onWatch) {
                onWatch(stream, streams)
            }
        } finally {
            setResolvingId(null)
        }
    }

    if (!streams || streams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 border border-white/5">
                    <Activity className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="text-zinc-300 font-bold mb-1">No streams available</h3>
                <p className="text-zinc-500 text-xs">This event hasn't started or no links were found.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-2" onClick={(e) => e.stopPropagation()}>
            {streams.map((stream, idx) => {
                const streamId = `stream-${idx}-${stream.streamer}`;
                const isResolving = resolvingId === streamId;
                const isVerified = ['Streameast', 'Sportsbest', 'Totalsportek', 'SoccerStreams', 'weakstreams', 'vipleague'].some(s =>
                    stream.streamer.toLowerCase().includes(s.toLowerCase())
                );

                return (
                    <div
                        key={streamId}
                        className="group relative flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#161d27]/40 border border-white/[0.03] hover:bg-[#1c2635] hover:border-emerald-500/30 transition-all duration-300 overflow-hidden"
                    >
                        {/* High-performance Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.02] to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        {/* Streamer & Major Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10">
                            <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-900/80 items-center justify-center border border-white/5 group-hover:border-emerald-500/40 transition-all duration-300 shadow-inner">
                                {isVerified ? (
                                    <ShieldCheck className="h-5 w-5 text-emerald-500/80 group-hover:text-emerald-400" />
                                ) : (
                                    <Globe className="h-5 w-5 text-zinc-600 group-hover:text-emerald-500/60" />
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-100 font-bold text-sm sm:text-base truncate group-hover:text-white transition-colors">
                                        {stream.streamer}
                                    </span>
                                    {isVerified && (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-4 uppercase font-black tracking-tighter px-1.5">
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] sm:text-xs text-zinc-500 font-medium truncate max-w-[120px] sm:max-w-none">
                                        {stream.link_name || 'Direct Link'}
                                    </span>
                                    <div className="h-1 w-1 rounded-full bg-zinc-700 sm:block hidden" />
                                    <Badge variant="outline" className="text-[9px] text-zinc-400 border-white/5 py-0 px-1.5 font-bold uppercase tracking-widest hidden sm:flex">
                                        {stream.quality || '720p'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Meta Info - Stats/Features */}
                        <div className="hidden lg:flex items-center gap-6 px-4 relative z-10">
                            {stream.mobile === 'yes' && (
                                <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Mobile</span>
                                </div>
                            )}

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Zap className={cn("h-3 w-3", stream.ads > 1 ? "text-orange-500/70" : "text-emerald-500/70")} />
                                    <span className={cn(
                                        "text-[11px] font-black",
                                        stream.ads > 1 ? "text-orange-500" : "text-emerald-500"
                                    )}>
                                        {stream.ads}
                                    </span>
                                </div>
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Ads Rating</span>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex-shrink-0 relative z-10 px-1">
                            <Button
                                size="sm"
                                onClick={() => handleWatch(stream, streamId)}
                                disabled={!!resolvingId}
                                className={cn(
                                    "relative h-11 w-11 sm:w-auto sm:h-10 sm:px-6 rounded-xl sm:rounded-lg overflow-hidden transition-all duration-300 active:scale-95 shadow-lg",
                                    "bg-emerald-500 hover:bg-emerald-400 text-white border-0",
                                    "disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500",
                                    isResolving && "animate-pulse"
                                )}
                            >
                                {isResolving ? (
                                    <Activity className="h-5 w-5 animate-spin-slow" />
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <PlayCircle className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2 fill-white/10" />
                                        <span className="hidden sm:inline font-black text-[11px] uppercase tracking-widest">Watch Live</span>
                                    </div>
                                )}

                                {/* Button Shine Animation */}
                                {!isResolving && !resolvingId && (
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
                                )}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}



