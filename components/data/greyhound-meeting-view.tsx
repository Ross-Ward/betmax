"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, User } from "lucide-react"
import { DataEvent } from "@/lib/types/data-schema"


interface GreyhoundMeetingViewProps {
    data: DataEvent[];
}

export function GreyhoundMeetingView({ data }: GreyhoundMeetingViewProps) {
    if (!data || !Array.isArray(data)) return null;

    // Group races by meeting (e.g. "Hove", "Oxford")
    const meetings: Record<string, DataEvent[]> = {};

    data.forEach(race => {
        const meetingName = race.metadata?.meeting || 'Unknown Meeting';
        if (!meetings[meetingName]) {
            meetings[meetingName] = [];
        }
        meetings[meetingName].push(race);
    });

    return (
        <div className="space-y-8">
            {Object.entries(meetings).map(([meetingName, races]) => (
                <div key={meetingName} className="space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-black uppercase tracking-tighter">{meetingName}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {races.map((race) => (
                            <Card key={race.id} className="rounded-3xl border-2 border-primary/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl transition-all hover:shadow-2xl hover:border-primary/20 group">
                                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-3 pt-4 px-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20 text-[10px] font-bold">
                                                {race.name.split(' ').pop()} {/* Time usually at end */}
                                            </Badge>
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{race.metadata?.date || 'Today'}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-primary/20 text-primary font-bold text-[10px]">
                                            {race.participants.length} RUNNERS
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="space-y-2">
                                        {(race.participants || []).slice(0, 3).map((runner, idx: number) => (
                                            <div key={runner.id} className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-primary/5 hover:bg-background transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={
                                                        `h-6 w-6 rounded-md flex items-center justify-center font-black text-xs border
                                                        ${runner.metadata?.trap === 1 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            runner.metadata?.trap === 2 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                runner.metadata?.trap === 3 ? 'bg-white/10 text-zinc-500 border-zinc-500/20' :
                                                                    runner.metadata?.trap === 4 ? 'bg-black/10 text-zinc-900 border-zinc-900/20 dark:text-zinc-100' :
                                                                        runner.metadata?.trap === 5 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                                            'bg-stripes-w-b text-zinc-500 border-zinc-500/20'
                                                        }`
                                                    }>
                                                        {runner.metadata?.trap || idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs tracking-tight line-clamp-1">{runner.name}</p>
                                                        <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                                                            <User className="h-2 w-2" /> {runner.metadata?.trainer || 'TBA'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-xs">{runner.metadata?.odds || '-'}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {race.participants.length > 3 && (
                                            <div className="pt-1 text-center">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">
                                                    + {race.participants.length - 3} More Runners
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
