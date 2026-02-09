"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { StreamLink } from "@/lib/types"
import { X, Maximize2, Minimize2, Move, RefreshCw, AlertCircle, Volume2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StreamPlayerProps {
    stream: StreamLink | null
    allStreams?: StreamLink[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSwitchStream?: (stream: StreamLink) => void
}

export function StreamPlayer({ stream, allStreams = [], open, onOpenChange, onSwitchStream }: StreamPlayerProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 100, y: 100 })
    const [size, setSize] = useState({ width: 800, height: 450 })
    const [isResizing, setIsResizing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showTroubleshoot, setShowTroubleshoot] = useState(false)
    const [key, setKey] = useState(0)
    const [isMinimized, setIsMinimized] = useState(false)

    const playerRef = useRef<HTMLDivElement>(null)
    const dragStartPos = useRef({ x: 0, y: 0 })
    const resizeStartSize = useRef({ width: 0, height: 0 })

    const [hasInitialPosition, setHasInitialPosition] = useState(false)

    useEffect(() => {
        if (open && !hasInitialPosition && typeof window !== 'undefined') {
            const w = Math.min(window.innerWidth * 0.9, 900)
            const h = (w * 9) / 16
            setSize({ width: w, height: h })
            setPosition({
                x: (window.innerWidth - w) / 2,
                y: (window.innerHeight - h) / 2
            })
            setHasInitialPosition(true)
            setIsLoading(true)
            setShowTroubleshoot(false)
            setKey(prev => prev + 1)
        }
    }, [open, hasInitialPosition])

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                if (isLoading) setShowTroubleshoot(true)
            }, 8000)
            return () => clearTimeout(timer)
        }
    }, [open, isLoading, key])

    const handleRefresh = useCallback(() => {
        setKey(prev => prev + 1)
        setIsLoading(true)
        setShowTroubleshoot(false)
    }, [])

    const onMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('.drag-handle') && !target.closest('button')) {
            setIsDragging(true)
            dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }
        }
    }

    const onResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        dragStartPos.current = { x: e.clientX, y: e.clientY }
        resizeStartSize.current = { ...size }
    }

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartPos.current.x,
                    y: e.clientY - dragStartPos.current.y
                })
            }
            if (isResizing) {
                const deltaX = e.clientX - dragStartPos.current.x
                const deltaY = e.clientY - dragStartPos.current.y
                const newWidth = Math.max(320, resizeStartSize.current.width + deltaX)
                const newHeight = Math.max(180, resizeStartSize.current.height + deltaY)
                setSize({ width: newWidth, height: newHeight })
            }
        }

        const onMouseUp = () => {
            setIsDragging(false)
            setIsResizing(false)
        }

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [isDragging, isResizing])

    if (!open || !stream) return null

    return (
        <div
            ref={playerRef}
            className={cn(
                "fixed z-[10000] bg-[#0a0a0c] rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group transition-all duration-300",
                isMinimized ? "h-14 w-72 bottom-6 right-6 scale-90 translate-y-0 opacity-100" : "animate-in fade-in zoom-in-95 duration-300"
            )}
            style={!isMinimized ? {
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
            } : {}}
            onMouseDown={onMouseDown}
        >
            {/* Header / Drag Handle */}
            <div className="drag-handle h-14 bg-[#121215] border-b border-white/5 flex items-center justify-between px-5 cursor-move select-none shrink-0">
                <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                        <Volume2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-black text-zinc-100 truncate max-w-[300px] uppercase tracking-wider">
                            {stream.link_name}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase truncate">
                                {stream.streamer}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-zinc-700" />
                            <span className="text-[10px] text-emerald-500 font-black uppercase">
                                {stream.quality}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); if (stream?.url) window.open(stream.referer || stream.url, '_blank'); }}
                        title="Open Source in New Tab"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
                        title="Refresh Stream"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-400/70 hover:text-white hover:bg-red-500/20 rounded-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Video Area */}
            <div className={cn("flex-1 relative bg-black flex flex-col", isMinimized && "hidden")}>
                {isDragging && (
                    <div className="absolute inset-0 z-[60] bg-transparent" />
                )}

                {/* Loading State Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 bg-[#0a0a0c] flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-emerald-500/10" />
                            <div className="absolute inset-0 h-16 w-16 rounded-full border-t-4 border-emerald-500 animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-zinc-200 font-black text-xs uppercase tracking-[0.3em] mb-1">Connecting to Stream</p>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase">Establishing secure connection...</p>
                        </div>
                    </div>
                )}

                {/* Troubleshooting State Overlay */}
                {showTroubleshoot && !isMinimized && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] bg-[#121215]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md animate-in slide-in-from-top-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-zinc-100 uppercase tracking-wider">Trouble loading?</p>
                            <p className="text-[10px] text-zinc-500 font-medium mt-0.5 leading-relaxed">
                                Most streams have ads or blockers.
                                <button
                                    onClick={() => window.open(stream.url, '_blank')}
                                    className="text-emerald-500 hover:underline mx-1 font-bold"
                                >
                                    Click here to open in new tab
                                </button>
                                or try refreshing.
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={() => setShowTroubleshoot(false)}>
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                <iframe
                    key={key}
                    src={stream.url}
                    onLoad={() => {
                        console.log("Iframe loaded");
                        setTimeout(() => setIsLoading(false), 1500);
                    }}
                    className="w-full h-full border-none bg-zinc-950"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />

                {/* Silent Audio Pitch Fix Logic */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        const fixAudio = () => {
                            try {
                                const videos = document.querySelectorAll('video');
                                videos.forEach(v => {
                                    if (v.playbackRate !== 1.0) v.playbackRate = 1.0;
                                    if (v.preservesPitch === false) v.preservesPitch = true;
                                    if (v.muted) v.muted = false; // Try to unmute
                                });
                            } catch(e) {}
                        };
                        setInterval(fixAudio, 3000);
                    })();
                `}} />
            </div>

            {/* Resize Handle */}
            {!isMinimized && (
                <div
                    className="absolute bottom-0 right-0 w-8 h-8 flex items-end justify-end p-1 cursor-nwse-resize z-[100] group/resize"
                    onMouseDown={onResizeMouseDown}
                >
                    <div className="w-3.5 h-3.5 border-r-4 border-b-4 border-white/10 rounded-br-sm group-hover/resize:border-emerald-500/30 transition-colors" />
                </div>
            )}
        </div >
    )
}
