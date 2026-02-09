"use client"

import { useStream } from "@/lib/stream-context"
import { StreamPlayer } from "./stream-player"

export function GlobalStreamPlayer() {

    const { activeStreams, closeStream, switchStream } = useStream()

    return (
        <>
            {activeStreams.map((instance) => (
                <StreamPlayer
                    key={instance.id}
                    stream={instance.link}
                    allStreams={instance.allLinks}
                    open={true}
                    onOpenChange={() => closeStream(instance.id)}
                    onSwitchStream={(newStream) => switchStream(instance.id, newStream)}
                />
            ))}
        </>
    )
}

