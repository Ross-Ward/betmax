"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { StreamLink } from "@/lib/types"

interface ActiveStreamInstance {
    id: string; // Unique instance ID
    link: StreamLink;
    allLinks: StreamLink[];
}


interface StreamContextType {
    activeStreams: ActiveStreamInstance[]
    openStream: (stream: StreamLink, all: StreamLink[]) => void
    closeStream: (instanceId: string) => void
    switchStream: (instanceId: string, stream: StreamLink) => void
}

const StreamContext = createContext<StreamContextType | undefined>(undefined)

export function StreamProvider({ children }: { children: ReactNode }) {
    const [activeStreams, setActiveStreams] = useState<ActiveStreamInstance[]>([])

    const openStream = (stream: StreamLink, all: StreamLink[]) => {
        // Allow multiple streams by adding a new instance with a unique ID
        const newInstance: ActiveStreamInstance = {
            id: Math.random().toString(36).substr(2, 9),
            link: stream,
            allLinks: all
        }
        setActiveStreams(prev => [...prev, newInstance])
    }

    const closeStream = (instanceId: string) => {
        setActiveStreams(prev => prev.filter(s => s.id !== instanceId))
    }

    const switchStream = (instanceId: string, stream: StreamLink) => {
        setActiveStreams(prev => prev.map(s =>
            s.id === instanceId ? { ...s, link: stream } : s
        ))
    }

    return (
        <StreamContext.Provider value={{ activeStreams, openStream, closeStream, switchStream }}>
            {children}
        </StreamContext.Provider>
    )
}


export function useStream() {
    const context = useContext(StreamContext)
    if (context === undefined) {
        throw new Error("useStream must be used within a StreamProvider")
    }
    return context
}
